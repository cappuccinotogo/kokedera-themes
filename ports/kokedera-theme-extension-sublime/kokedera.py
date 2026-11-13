"""Apply the matching Kokedera editor and interface palette."""
import sublime
import sublime_plugin

VARIANTS = ["Dusk","Morning","Night","Spring","Summer","Autumn","Winter","Rain","Mist"]

class KokederaSelectCommand(sublime_plugin.ApplicationCommand):
    def run(self, variant="Dusk"):
        if variant not in VARIANTS:
            raise ValueError("Unknown Kokedera variant: " + variant)
        settings = sublime.load_settings("Preferences.sublime-settings")
        settings.set("color_scheme", "Kokedera " + variant + ".sublime-color-scheme")
        settings.set("theme", "Kokedera " + variant + ".sublime-theme")
        sublime.save_settings("Preferences.sublime-settings")
