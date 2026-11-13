"""Package only verified generated files; fixed ZIP timestamps make archives reproducible."""
import hashlib
import json
import pathlib
import sys
import zipfile

root = pathlib.Path(__file__).resolve().parents[1]
source = root / (sys.argv[1] if len(sys.argv) > 1 else '.build')
destination = root / 'dist'
destination.mkdir(exist_ok=True)

def files(repo):
    manifest = json.loads((repo / 'kokedera.json').read_text(encoding='utf-8'))
    for name, digest in manifest['files'].items():
        path = (repo / name).resolve()
        if not path.is_relative_to(repo.resolve()):
            raise ValueError(f'Path escaped repository: {name}')
        if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            raise ValueError(f'File changed: {repo.name}/{name}')
    return sorted([*manifest['files'], 'kokedera.json'])

def add(archive, name, data):
    info = zipfile.ZipInfo(name, (2026, 9, 12, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    archive.writestr(info, data)

repos = sorted(source.glob('kokedera-theme-*'))
if len(repos) != 14:
    raise SystemExit(f'Expected 14 distribution repositories, found {len(repos)}')
with zipfile.ZipFile(destination / 'kokedera-all-ports-1.0.0.zip', 'w') as combined:
    for repo in repos:
        with zipfile.ZipFile(destination / f'{repo.name}-1.0.0.zip', 'w') as archive:
            for name in files(repo):
                data = (repo / name).read_bytes()
                add(archive, name, data)
                add(combined, f'{repo.name}/{name}', data)
checksums = '\n'.join(f'{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}' for path in sorted(destination.glob('*.zip'))) + '\n'
(destination / 'SHA256SUMS').write_text(checksums, encoding='utf-8')
print(f'Packaged {len(repos)} repositories and one combined archive into {destination}.')
