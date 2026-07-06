# Kotlin practice projects

This folder is where practice projects for the course live. Drop one or more Gradle
projects in here (one subfolder each), e.g. `kotlin/playground/`, `kotlin/channels-demo/`.

These are independent of the Node tooling in the rest of the repo — `node_modules` and
npm workspaces don't touch this folder.

## Suggested minimal setup

Create a subfolder and initialize a Gradle project (`gradle init`, or via IntelliJ IDEA).
To use coroutines, add the dependency in `build.gradle.kts`:

```kotlin
plugins {
    kotlin("jvm") version "2.1.0"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.1")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.1")
    testImplementation(kotlin("test"))
}

application {
    mainClass.set("MainKt")
}
```

Then run with `./gradlew run` (macOS/Linux) or `gradlew.bat run` (Windows).

Build output (`build/`, `.gradle/`) is gitignored.
