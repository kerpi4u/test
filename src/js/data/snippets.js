/**
 * Hello World in 20 languages.
 * `keywords` drives the tiny hand-written highlighter (lib/highlight.js).
 */
export const SNIPPETS = [
  {
    id: "javascript",
    name: "JavaScript",
    file: "hello.js",
    keywords: ["const", "function", "for", "let", "return"],
    code: `// hello.js
const greeting = "Hello, World!";

function say(text, { times = 1, loud = false } = {}) {
  const message = loud ? text.toUpperCase() : text;
  for (let i = 0; i < times; i++) console.log(message);
}

say(greeting, { times: 3, loud: true });`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    file: "hello.ts",
    keywords: ["const", "function", "interface", "string", "boolean", "return", "for", "let"],
    code: `// hello.ts
interface Greeting {
  text: string;
  loud?: boolean;
}

const greet = ({ text, loud = false }: Greeting): string =>
  loud ? text.toUpperCase() : text;

console.log(greet({ text: "Hello, World!", loud: true }));`,
  },
  {
    id: "python",
    name: "Python",
    file: "hello.py",
    keywords: ["def", "for", "in", "return", "if", "else", "import", "print"],
    code: `# hello.py
def greet(name: str = "World") -> str:
    return f"Hello, {name}!"

for _ in range(3):
    print(greet())`,
  },
  {
    id: "go",
    name: "Go",
    file: "main.go",
    keywords: ["package", "import", "func", "var", "for", "return", "string"],
    code: `package main

import "fmt"

func greet(name string) string {
	return fmt.Sprintf("Hello, %s!", name)
}

func main() {
	for i := 0; i < 3; i++ {
		fmt.Println(greet("World"))
	}
}`,
  },
  {
    id: "rust",
    name: "Rust",
    file: "main.rs",
    keywords: ["fn", "let", "mut", "for", "in", "println", "use"],
    code: `fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    for _ in 0..3 {
        println!("{}", greet("World"));
    }
}`,
  },
  {
    id: "c",
    name: "C",
    file: "hello.c",
    keywords: ["include", "int", "void", "for", "return", "printf", "main"],
    code: `#include <stdio.h>

int main(void) {
    for (int i = 0; i < 3; i++) {
        printf("Hello, World!\\n");
    }
    return 0;
}`,
  },
  {
    id: "cpp",
    name: "C++",
    file: "hello.cpp",
    keywords: ["include", "using", "namespace", "int", "for", "return", "std", "cout"],
    code: `#include <iostream>

int main() {
    for (int i = 0; i < 3; ++i) {
        std::cout << "Hello, World!" << std::endl;
    }
    return 0;
}`,
  },
  {
    id: "csharp",
    name: "C#",
    file: "Program.cs",
    keywords: ["using", "namespace", "class", "static", "void", "string", "for", "var", "return"],
    code: `using System;

namespace HelloWorld;

public static class Program
{
    public static void Main()
    {
        for (var i = 0; i < 3; i++)
            Console.WriteLine("Hello, World!");
    }
}`,
  },
  {
    id: "java",
    name: "Java",
    file: "Hello.java",
    keywords: ["public", "class", "static", "void", "for", "int", "new", "return", "System"],
    code: `public class Hello {
    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
            System.out.println("Hello, World!");
        }
    }
}`,
  },
  {
    id: "kotlin",
    name: "Kotlin",
    file: "Hello.kt",
    keywords: ["fun", "val", "var", "repeat", "return", "println"],
    code: `fun greet(name: String = "World") = "Hello, $name!"

fun main() {
    repeat(3) {
        println(greet())
    }
}`,
  },
  {
    id: "swift",
    name: "Swift",
    file: "main.swift",
    keywords: ["func", "let", "var", "for", "in", "return", "print"],
    code: `func greet(_ name: String = "World") -> String {
    return "Hello, \\(name)!"
}

for _ in 0..<3 {
    print(greet())
}`,
  },
  {
    id: "ruby",
    name: "Ruby",
    file: "hello.rb",
    keywords: ["def", "end", "do", "times", "puts", "return", "if"],
    code: `# hello.rb
def greet(name = "World")
  "Hello, #{name}!"
end

3.times { puts greet }`,
  },
  {
    id: "php",
    name: "PHP",
    file: "hello.php",
    keywords: ["function", "for", "echo", "return", "foreach", "as"],
    code: `<?php
function greet(string $name = "World"): string {
    return "Hello, {$name}!";
}

for ($i = 0; $i < 3; $i++) {
    echo greet() . PHP_EOL;
}`,
  },
  {
    id: "bash",
    name: "Bash",
    file: "hello.sh",
    keywords: ["function", "for", "do", "done", "echo", "in", "local"],
    code: `#!/usr/bin/env bash
greet() {
  local name="\${1:-World}"
  echo "Hello, $name!"
}

for _ in 1 2 3; do
  greet
done`,
  },
  {
    id: "sql",
    name: "SQL",
    file: "hello.sql",
    keywords: ["select", "from", "as", "where", "with", "limit"],
    code: `SELECT 'Hello, World!' AS greeting,
       CURRENT_TIMESTAMP AS sent_at
FROM (VALUES (1), (2), (3)) AS t(n);`,
  },
  {
    id: "haskell",
    name: "Haskell",
    file: "Main.hs",
    keywords: ["module", "where", "main", "putStrLn", "import", "mapM_"],
    code: `module Main where

greet :: String -> String
greet name = "Hello, " ++ name ++ "!"

main :: IO ()
main = mapM_ (putStrLn . greet) (replicate 3 "World")`,
  },
  {
    id: "elixir",
    name: "Elixir",
    file: "hello.exs",
    keywords: ["defmodule", "def", "do", "end", "for", "IO", "puts"],
    code: `defmodule Hello do
  def greet(name \\\\ "World"), do: "Hello, #{name}!"

  def run do
    for _ <- 1..3, do: IO.puts(greet())
  end
end

Hello.run()`,
  },
  {
    id: "zig",
    name: "Zig",
    file: "main.zig",
    keywords: ["const", "var", "fn", "pub", "while", "return", "std"],
    code: `const std = @import("std");

pub fn main() !void {
    var i: u8 = 0;
    while (i < 3) : (i += 1) {
        std.debug.print("Hello, World!\\n", .{});
    }
}`,
  },
  {
    id: "lua",
    name: "Lua",
    file: "hello.lua",
    keywords: ["function", "local", "for", "do", "end", "print", "return"],
    code: `local function greet(name)
  name = name or "World"
  return "Hello, " .. name .. "!"
end

for _ = 1, 3 do
  print(greet())
end`,
  },
  {
    id: "dart",
    name: "Dart",
    file: "hello.dart",
    keywords: ["void", "main", "for", "var", "String", "final", "print"],
    code: `String greet([String name = 'World']) => 'Hello, $name!';

void main() {
  for (var i = 0; i < 3; i++) {
    print(greet());
  }
}`,
  },
];

/** Rotating headline examples for the typewriter effect in the hero. */
export const GREETINGS = [
  'console.log("Hello, World!")',
  'print("Hello, World!")',
  'fmt.Println("Hello, World!")',
  'puts "Hello, World!"',
  'println!("Hello, World!")',
  'echo "Hello, World!"',
  'Console.WriteLine("Hello, World!")',
  'std::cout << "Hello, World!"',
];
