package com.seventhlayer.kokedera.icons

import com.intellij.ide.FileIconProvider
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.vfs.VirtualFile
import javax.swing.Icon

class KokederaFileIconProvider : FileIconProvider {

    override fun getIcon(file: VirtualFile, flags: Int, project: Project?): Icon? {
        if (file.isDirectory) return null
        return KokederaIconMappings.fileIconName(file.name, file.extension, file.path)
            ?.let { loadIcon(it) }
    }

    private fun loadIcon(name: String): Icon {
        return IconLoader.getIcon(KokederaIconSet.iconPath(name), KokederaFileIconProvider::class.java)
    }
}
