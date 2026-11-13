import type { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';

const variants = [
  {
    "id": "dusk",
    "name": "Kokedera Dusk",
    "isLight": false
  },
  {
    "id": "morning",
    "name": "Kokedera Morning",
    "isLight": true
  },
  {
    "id": "night",
    "name": "Kokedera Night",
    "isLight": false
  },
  {
    "id": "spring",
    "name": "Kokedera Spring",
    "isLight": false
  },
  {
    "id": "summer",
    "name": "Kokedera Summer",
    "isLight": false
  },
  {
    "id": "autumn",
    "name": "Kokedera Autumn",
    "isLight": false
  },
  {
    "id": "winter",
    "name": "Kokedera Winter",
    "isLight": true
  },
  {
    "id": "rain",
    "name": "Kokedera Rain",
    "isLight": false
  },
  {
    "id": "mist",
    "name": "Kokedera Mist",
    "isLight": false
  }
];

const plugin: JupyterFrontEndPlugin<void> = {
  id: '@kokedera/jupyterlab-theme:plugin',
  description: 'Nine Kokedera moss temple palettes.',
  autoStart: true,
  requires: [IThemeManager],
  activate: (_app: JupyterFrontEnd, manager: IThemeManager): void => {
    for (const variant of variants) {
      manager.register({
        name: variant.name,
        displayName: variant.name,
        isLight: variant.isLight,
        themeScrollbars: true,
        load: async () => {
          document.documentElement.dataset.kokederaTheme = variant.id;
          // Retain the complete built-in layout, typography and component foundation.
          const base = variant.isLight ? 'light' : 'dark';
          await manager.loadCSS('@jupyterlab/theme-' + base + '-extension/index.css');
          await manager.loadCSS('@kokedera/jupyterlab-theme/index.css');
        },
        unload: async () => {
          if (document.documentElement.dataset.kokederaTheme === variant.id) {
            delete document.documentElement.dataset.kokederaTheme;
          }
        }
      });
    }
  }
};
export default plugin;
