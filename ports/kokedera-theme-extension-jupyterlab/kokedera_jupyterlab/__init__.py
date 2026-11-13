"""Kokedera's prebuilt JupyterLab theme extension."""
__version__ = "1.0.0"

def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "@kokedera/jupyterlab-theme"}]
