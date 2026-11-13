package com.seventhlayer.kokedera.icons

import com.intellij.ide.ui.LafManager
import com.intellij.ui.JBColor

/**
 * Resolves which icon set to serve. Each Kokedera color theme variant ships a
 * matching set under /icons/<variant>/; the root /icons/ directory holds the
 * Dusk set. When a Kokedera theme is active the icons follow it automatically;
 * under any other theme we fall back to Morning on bright IDEs and Dusk on
 * dark ones.
 */
object KokederaIconSet {

    private val VARIANTS = setOf(
        "morning", "night", "spring", "summer", "autumn", "winter", "rain", "mist",
    )

    /** Path prefix inside /icons/ — either "" (Dusk) or "<variant>/". */
    fun prefix(): String {
        val laf = runCatching { LafManager.getInstance().currentUIThemeLookAndFeel?.name }.getOrNull()
        if (laf != null && laf.startsWith("Kokedera ")) {
            val variant = laf.removePrefix("Kokedera ").lowercase()
            if (variant in VARIANTS) return "$variant/"
            return "" // "Kokedera Dusk" and anything unknown
        }
        return if (JBColor.isBright()) "morning/" else ""
    }

    fun iconPath(name: String): String = "/icons/${prefix()}$name.svg"
}
