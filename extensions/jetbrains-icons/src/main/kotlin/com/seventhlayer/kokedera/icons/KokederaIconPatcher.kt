package com.seventhlayer.kokedera.icons

import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.util.IconPathPatcher

class KokederaIconPatcher : IconPathPatcher() {

    private val iconMappings = mapOf(
        // Core file types (platform/icons)
        "/fileTypes/html.svg" to "/icons/html.svg",
        "/fileTypes/css.svg" to "/icons/css.svg",
        "/fileTypes/xml.svg" to "/icons/xml.svg",
        "/fileTypes/json.svg" to "/icons/json.svg",
        "/fileTypes/yaml.svg" to "/icons/yaml.svg",
        "/fileTypes/text.svg" to "/icons/txt.svg",
        "/fileTypes/javaScript.svg" to "/icons/javascript.svg",
        "/fileTypes/typeScript.svg" to "/icons/typescript.svg",
        "/fileTypes/java.svg" to "/icons/java.svg",
        "/fileTypes/javaClass.svg" to "/icons/java.svg",
        "/fileTypes/archive.svg" to "/icons/archive.svg",
        "/fileTypes/image.svg" to "/icons/image.svg",
        "/fileTypes/properties.svg" to "/icons/toml.svg",
        "/fileTypes/dtd.svg" to "/icons/xml.svg",
        "/fileTypes/xhtml.svg" to "/icons/html.svg",
        "/fileTypes/manifest.svg" to "/icons/json.svg",
        "/fileTypes/any_type.svg" to "/icons/default.svg",
        "/fileTypes/unknown.svg" to "/icons/default.svg",

        // Kotlin plugin
        "/org/jetbrains/kotlin/idea/icons/kotlin.svg" to "/icons/kotlin.svg",
        "/org/jetbrains/kotlin/idea/icons/kotlin_file.svg" to "/icons/kotlin.svg",
        "/org/jetbrains/kotlin/idea/icons/kotlin_script.svg" to "/icons/kotlin.svg",
        "/org/jetbrains/kotlin/idea/icons/classKotlin.svg" to "/icons/kotlin.svg",

        // Nodes (New menu, project tree structure)
        "/nodes/class.svg" to "/icons/java.svg",
        "/nodes/package.svg" to "/icons/package.svg",
        "/nodes/folder.svg" to "/icons/folder-closed.svg",
        "/nodes/folderOpen.svg" to "/icons/folder-open.svg",
        "/nodes/project.svg" to "/icons/folder-src-closed.svg",

        // Docker plugin
        "/icons/docker/Docker.svg" to "/icons/docker.svg",
        "/icons/docker/docker.svg" to "/icons/docker.svg",
        "/icons/docker/Dockerfile.svg" to "/icons/docker.svg",
        "/icons/docker/dockerfile.svg" to "/icons/docker.svg",
        "/icons/docker/DockerCompose.svg" to "/icons/docker-compose.svg",

        // Database / SQL
        "/icons/databaseIcons/dbms/sql.svg" to "/icons/sql.svg",
        "/icons/databaseIcons/table.svg" to "/icons/sql.svg",

        // Shell
        "/plugins/sh/icons/shFile.svg" to "/icons/shell.svg",

        // Markdown
        "/icons/org.intellij.plugins.markdown/MarkdownPlugin.svg" to "/icons/markdown.svg",

        // Python
        "/icons/com.jetbrains.python/pythonFile.svg" to "/icons/python.svg",
        "/icons/python/pythonFile.svg" to "/icons/python.svg",

        // Ruby
        "/icons/org.jetbrains.plugins.ruby/ruby/ruby.svg" to "/icons/ruby.svg",

        // PHP
        "/icons/com.jetbrains.php/php-icon.svg" to "/icons/php.svg",
        "/com/jetbrains/php/PhpIcons/PhpIcon.svg" to "/icons/php.svg",

        // Go
        "/icons/org.jetbrains.plugins.go/go.svg" to "/icons/go.svg",

        // Rust
        "/icons/org.rust.lang/rust.svg" to "/icons/rust.svg",

        // Dart / Flutter
        "/icons/Dart/dart_file.svg" to "/icons/dart.svg",

        // Vue
        "/icons/org.jetbrains.plugins.vue/vue.svg" to "/icons/vue.svg",

        // Angular
        "/icons/angular2/angular2.svg" to "/icons/angular.svg",

        // Svelte
        "/icons/svelte/svelte.svg" to "/icons/svelte.svg",

        // Terraform
        "/icons/org.intellij.plugins.hcl/terraform.svg" to "/icons/terraform.svg",

        // EditorConfig
        "/icons/editorconfig/editorconfig.svg" to "/icons/editorconfig.svg",
        "/org/editorconfig/icons/editorconfig.svg" to "/icons/editorconfig.svg",

        // Git
        "/vcs/branch.svg" to "/icons/gitignore.svg",

        // Actions - New File menu
        "/actions/newFile.svg" to "/icons/default.svg",

        // HTTP
        "/icons/restClient/http_request.svg" to "/icons/json.svg",

        // OpenAPI
        "/icons/openapi/openapi.svg" to "/icons/yaml.svg",

        // Resource Bundle
        "/fileTypes/properties.svg" to "/icons/toml.svg",
    )

    override fun patchPath(path: String, classLoader: ClassLoader?): String? {
        val target = iconMappings[path] ?: return null
        // route into the icon set matching the active theme variant
        return "/icons/" + KokederaIconSet.prefix() + target.removePrefix("/icons/")
    }

    override fun getContextClassLoader(path: String, originalClassLoader: ClassLoader?): ClassLoader? {
        return if (iconMappings.containsKey(path)) {
            javaClass.classLoader
        } else {
            originalClassLoader
        }
    }

    companion object {
        fun install() {
            IconLoader.installPathPatcher(KokederaIconPatcher())
        }
    }
}
