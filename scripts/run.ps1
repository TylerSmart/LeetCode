[CmdletBinding()]
param(
    [string]$Problem,
    [string]$FilePath,
    [ValidateSet('C', 'C#', 'C++', 'Java', 'Python', 'Rust', 'TypeScript')]
    [string]$Language,
    [switch]$BuildOnly
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$problemsRoot = Join-Path $root 'problems'

function Find-Tool([string[]]$Names) {
    foreach ($name in $Names) {
        $tool = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($tool) { return $tool.Source }
    }
    throw "Missing tool: $($Names -join ' or '). Install it and restart VS Code so PATH is refreshed."
}

function Invoke-Checked([string]$Tool, [string[]]$Arguments) {
    & $Tool @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code ${LASTEXITCODE}: $Tool" }
}

function Build-Native {
    $isCpp = $Language -eq 'C++'
    $names = if ($isCpp) { @('g++', 'clang++') } else { @('gcc', 'clang') }
    $compiler = $null
    if (-not $BuildOnly) {
        foreach ($name in $names) {
            $compiler = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($compiler) { break }
        }
    }
    $sources = if ($isCpp) { @((Join-Path $source 'main.cpp')) } else { @((Join-Path $source 'solution.c'), (Join-Path $source 'main.c')) }
    $binary = Join-Path $build 'practice.exe'
    if ($compiler) {
        $standard = if ($isCpp) { '-std=c++17' } else { '-std=c17' }
        Invoke-Checked $compiler.Source (@($standard, '-Wall', '-Wextra') + $sources + @('-o', $binary))
    } else {
        if (-not (Get-Command cl -CommandType Application -ErrorAction SilentlyContinue)) {
            $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
            if (-not (Test-Path $vswhere)) { throw 'MSVC is required for native F5 debugging. Install Visual Studio C++ build tools, or use GCC/Clang for run-only tasks.' }
            $installation = & $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
            if (-not $installation) { throw 'Visual Studio C++ build tools were not found.' }
            & (Join-Path $installation 'Common7/Tools/Launch-VsDevShell.ps1') -Arch amd64 -HostArch amd64 -SkipAutomaticLocation | Out-Null
        }
        $cl = Find-Tool @('cl')
        $flags = if ($isCpp) { @('/std:c++17', '/EHsc') } else { @('/std:c17', '/TC') }
        Push-Location $build
        try {
            Invoke-Checked $cl (@('/nologo', '/W4', '/Zi', '/Od', '/Fepractice.exe', '/Fdcompiler.pdb') + $flags + $sources + @('/link', '/DEBUG', '/PDB:practice.pdb'))
        } finally {
            Pop-Location
        }
    }
    if (-not $BuildOnly) { Invoke-Checked $binary @() }
}

function Find-JavaTool([string]$Name) {
    $local = Join-Path $root ".tools/jdk/bin/$Name.exe"
    if (Test-Path $local -PathType Leaf) { return $local }
    if ($env:JAVA_HOME) {
        $installed = Join-Path $env:JAVA_HOME "bin/$Name.exe"
        if (Test-Path $installed -PathType Leaf) { return $installed }
    }
    return Find-Tool @($Name)
}

if ($FilePath) {
    $relative = [System.IO.Path]::GetRelativePath($problemsRoot, $FilePath)
    $parts = $relative -split '[\\/]'
    if (-not $Problem) { $Problem = $parts[0] }
    if (-not $Language -and $parts.Length -gt 2) { $Language = $parts[1] }
}
if ($Problem -notmatch '^\d+$') { throw 'Open a file inside problems/<number>, or pass -Problem <number>.' }
if ($Language -notin @('C', 'C#', 'C++', 'Java', 'Python', 'Rust', 'TypeScript')) {
    throw 'Open a language source file, or pass -Language C, C#, C++, Java, Python, Rust, or TypeScript.'
}
if ($BuildOnly -and $Language -notin @('C', 'C++', 'Java', 'Rust')) {
    throw '-BuildOnly is supported for C, C++, Java, and Rust.'
}
$source = Join-Path (Join-Path $problemsRoot $Problem) $Language
if (-not (Test-Path $source -PathType Container)) { throw "Problem language folder does not exist: $source" }
$build = Join-Path (Join-Path (Join-Path $root '.build') $Problem) $Language
if ($BuildOnly) { $build = Join-Path (Join-Path $root '.build/debug') $Language }
New-Item -ItemType Directory -Path $build -Force | Out-Null
$action = if ($BuildOnly) { 'Building' } else { 'Running' }
Write-Host "$action problem $Problem ($Language)"

switch ($Language) {
    'C' { Build-Native }
    'C++' { Build-Native }
    'C#' {
        $dotnet = Find-Tool @('dotnet')
        Invoke-Checked $dotnet @('run', '--project', (Join-Path $source 'Practice.csproj'))
    }
    'Java' {
        $compiler = Find-JavaTool 'javac'
        Invoke-Checked $compiler @('-g', '-d', $build, (Join-Path $source 'Solution.java'), (Join-Path $source 'Main.java'))
        if (-not $BuildOnly) {
            $java = Find-JavaTool 'java'
            Invoke-Checked $java @('-cp', $build, 'Main')
        }
    }
    'Python' {
        $localPython = Join-Path $root '.venv/Scripts/python.exe'
        if (-not (Test-Path $localPython -PathType Leaf)) {
            $localPython = Join-Path $root '.venv/bin/python'
        }
        $python = if (Test-Path $localPython -PathType Leaf) { $localPython } else { Find-Tool @('py', 'python', 'python3') }
        $arguments = @()
        if ([System.IO.Path]::GetFileNameWithoutExtension($python) -eq 'py') { $arguments += '-3' }
        Invoke-Checked $python ($arguments + @((Join-Path $source 'main.py')))
    }
    'Rust' {
        $command = Get-Command cargo -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        $cargoHome = if ($env:CARGO_HOME) { $env:CARGO_HOME } else { Join-Path $env:USERPROFILE '.cargo' }
        $cargo = if ($command) { $command.Source } else { Join-Path $cargoHome 'bin/cargo.exe' }
        if (-not (Test-Path $cargo -PathType Leaf)) { throw 'Rust/Cargo was not found. Install Rust with rustup and restart VS Code.' }
        $previousPath = $env:PATH
        try {
            $env:PATH = (Split-Path $cargo -Parent) + [System.IO.Path]::PathSeparator + $env:PATH
            Invoke-Checked $cargo @('build', '--manifest-path', (Join-Path $source 'Cargo.toml'), '--target-dir', $build, '--bin', 'practice')
            if (-not $BuildOnly) {
                $binary = if ($IsWindows) { 'debug/practice.exe' } else { 'debug/practice' }
                Invoke-Checked (Join-Path $build $binary) @()
            }
        } finally {
            $env:PATH = $previousPath
        }
    }
    'TypeScript' {
        $node = Find-Tool @('node')
        $compiler = Join-Path $root 'node_modules/typescript/bin/tsc'
        if (-not (Test-Path $compiler)) { throw 'TypeScript is not installed locally. Run npm install from the repository root.' }
        Invoke-Checked $node @($compiler, '--project', (Join-Path $source 'tsconfig.json'), '--outDir', $build)
        Invoke-Checked $node @((Join-Path $build 'main.js'))
    }
}