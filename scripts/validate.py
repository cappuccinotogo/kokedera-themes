"""Run independent standard-library parsers on every generated repository."""
import pathlib
import subprocess
import sys

target = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '.build').resolve()
repos = sorted(target.glob('kokedera-theme-*'))
if not repos:
    raise SystemExit(f'No generated repositories under {target}')
for repo in repos:
    subprocess.run([sys.executable, str(repo / 'scripts/verify.py')], check=True)
print(f'All {len(repos)} generated repositories verified.')
