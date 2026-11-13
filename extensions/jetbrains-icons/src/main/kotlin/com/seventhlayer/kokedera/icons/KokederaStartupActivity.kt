package com.seventhlayer.kokedera.icons

import com.intellij.ide.AppLifecycleListener
import com.intellij.openapi.util.IconLoader

class KokederaStartupActivity : AppLifecycleListener {
    override fun appFrameCreated(commandLineArgs: MutableList<String>) {
        IconLoader.installPathPatcher(KokederaIconPatcher())
    }
}
