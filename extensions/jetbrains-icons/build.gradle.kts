plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "2.2.20"
    id("org.jetbrains.intellij.platform") version "2.17.0"
}

group = providers.gradleProperty("pluginGroup").get()
version = providers.gradleProperty("pluginVersion").get()

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        create(providers.gradleProperty("platformType"), providers.gradleProperty("platformVersion"))
    }
}

intellijPlatform {
    pluginConfiguration {
        name = providers.gradleProperty("pluginName")
        ideaVersion {
            sinceBuild = providers.gradleProperty("pluginSinceBuild")
            // No untilBuild: the plugin stays compatible with all future IDE versions
            untilBuild = provider { null }
        }
    }

    publishing {
        token = providers.environmentVariable("PUBLISH_TOKEN")
    }
}

// The SVGs live once in the monorepo's icons/ folder. This task writes the
// 16x16 JetBrains copy into src/main/resources/icons before resources are packaged.
val monorepoRoot = layout.projectDirectory.dir("../..")
val generateIcons by tasks.registering(Exec::class) {
    description = "Generates the JetBrains icon copies from the shared icons/ folder."
    workingDir = monorepoRoot.asFile
    commandLine("node", "tools/icons.mjs", "jetbrains")
    inputs.dir(monorepoRoot.dir("icons"))
    inputs.file(monorepoRoot.file("tools/icons.mjs"))
    outputs.dir(layout.projectDirectory.dir("src/main/resources/icons"))
}

tasks {
    wrapper {
        gradleVersion = "9.1.0"
    }
    processResources {
        dependsOn(generateIcons)
    }
}
