package com.seventhlayer.kokedera.icons

import com.intellij.ide.IconProvider
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.util.IconLoader
import com.intellij.psi.PsiDirectory
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile
import javax.swing.Icon

class KokederaDirectoryIconProvider : IconProvider(), DumbAware {

    override fun getIcon(element: PsiElement, flags: Int): Icon? {
        return when (element) {
            is PsiDirectory -> {
                val name = KokederaIconMappings.folderIconName(element.name) ?: "folder-closed"
                loadIcon(name)
            }
            is PsiFile -> {
                KokederaIconMappings.fileIconName(
                    element.name,
                    element.virtualFile?.extension,
                    element.virtualFile?.path,
                )?.let { loadIcon(it) }
            }
            else -> null
        }
    }

    private fun loadIcon(name: String): Icon {
        return IconLoader.getIcon(KokederaIconSet.iconPath(name), KokederaDirectoryIconProvider::class.java)
    }
}
