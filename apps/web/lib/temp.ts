
import { create } from "zustand";

type Filters = {
  search: string
  difficulty: "EASY" | "MEDIUM" | "HARD" | null
  status: "SOLVED" | "ATTEMPTED" | "UNSOLVED" | null
  tags: string[]
}

type ProblemsStore = {
  filters: Filters
  setSearch: (search: string) => void
  setDifficulty: (difficulty: Filters["difficulty"]) => void
  setStatus: (status: Filters["status"]) => void
  toggleTag: (tag: string) => void
  clearFilters: () => void
}

const initialFilters: Filters = {
  search: "",
  difficulty: null,
  status: null,
  tags: [],
}

export type Problem = {
  id: string
  serialNumber: number
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  tags: string[]
  status: "SOLVED" | "ATTEMPTED" | "UNSOLVED"
}


export const problems: Problem[] = [
  {
    id: "1",
    serialNumber: 1,
    title: "Two Sum",
    difficulty: "EASY",
    tags: ["Array", "Hash Table"],
    status: "SOLVED",
  },
  {
    id: "2",
    serialNumber: 2,
    title: "Add Two Numbers",
    difficulty: "MEDIUM",
    tags: ["Linked List", "Math", "Recursion"],
    status: "ATTEMPTED",
  },
  {
    id: "3",
    serialNumber: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    tags: ["Hash Table", "String", "Sliding Window"],
    status: "UNSOLVED",
  },
  {
    id: "4",
    serialNumber: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "HARD",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    status: "UNSOLVED",
  },
  {
    id: "5",
    serialNumber: 5,
    title: "Longest Palindromic Substring",
    difficulty: "MEDIUM",
    tags: ["String", "Dynamic Programming"],
    status: "SOLVED",
  },
  {
    id: "6",
    serialNumber: 6,
    title: "Zigzag Conversion",
    difficulty: "MEDIUM",
    tags: ["String"],
    status: "UNSOLVED",
  },
  {
    id: "7",
    serialNumber: 7,
    title: "Reverse Integer",
    difficulty: "EASY",
    tags: ["Math"],
    status: "SOLVED",
  },
  {
    id: "8",
    serialNumber: 8,
    title: "String to Integer (atoi)",
    difficulty: "MEDIUM",
    tags: ["String"],
    status: "ATTEMPTED",
  },
  {
    id: "9",
    serialNumber: 9,
    title: "Palindrome Number",
    difficulty: "EASY",
    tags: ["Math"],
    status: "SOLVED",
  },
  {
    id: "10",
    serialNumber: 10,
    title: "Regular Expression Matching",
    difficulty: "HARD",
    tags: ["String", "Dynamic Programming", "Recursion"],
    status: "UNSOLVED",
  },
  {
    id: "11",
    serialNumber: 11,
    title: "Container With Most Water",
    difficulty: "MEDIUM",
    tags: ["Array", "Two Pointers", "Greedy"],
    status: "UNSOLVED",
  },
  {
    id: "12",
    serialNumber: 12,
    title: "Integer to Roman",
    difficulty: "MEDIUM",
    tags: ["Hash Table", "Math", "String"],
    status: "SOLVED",
  },
  {
    id: "13",
    serialNumber: 13,
    title: "Roman to Integer",
    difficulty: "EASY",
    tags: ["Hash Table", "Math", "String"],
    status: "SOLVED",
  },
  {
    id: "14",
    serialNumber: 14,
    title: "Longest Common Prefix",
    difficulty: "EASY",
    tags: ["String", "Trie"],
    status: "ATTEMPTED",
  },
  {
    id: "15",
    serialNumber: 15,
    title: "3Sum",
    difficulty: "MEDIUM",
    tags: ["Array", "Two Pointers", "Sorting"],
    status: "UNSOLVED",
  },
]



export const allTags = Array.from(new Set(problems.flatMap((p) => p.tags))).sort()


export type TestCase = {
  id: string
  input: string
  expectedOutput: string
  actualOutput?: string
  status?: "passed" | "failed" | "pending"
}

export type ProblemDetail = {
  id: string
  title: string
  problemType: "EASY" | "MEDIUM" | "HARD"
  description: string
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
  constraints: string[]
  testCases: TestCase[]
  starterCode: {
    CPP: string
    PYTHON: string
    JAVA: string
    JAVASCRIPT: string
    TYPESCRIPT: string
    RUST: string
    GO: string
  }
}

const DEFAULT_STARTER_CODES = {
  CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // your code goes here
}`,

  PYTHON: `def main():
    # cook your dish here

if __name__ == "__main__":
    main()`,

  JAVA: `import java.util.*;
import java.lang.*;
import java.io.*;

class Codechef {
    public static void main (String[] args) throws java.lang.Exception {
        // your code goes here
    }
}`,

  RUST: `fn main() {
    println!("Hello, world!");
}`,

  GO: `package main
import "fmt"

func main(){
    // your code goes here
}`,

  JAVASCRIPT: `function main(){
  // your code goes here  
}

main();`,

  TYPESCRIPT: `function main(){
  // your code goes here  
}

main();`,
}

export const problemDetails: Record<string, ProblemDetail> = {
  "1": {
    id: "1",
    title: "Two Sum",
    problemType: "EASY",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    testCases: [
      { id: "1", input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
      { id: "2", input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
      { id: "3", input: "[3,3]\n6", expectedOutput: "[0,1]" },
    ],
    starterCode: { ...DEFAULT_STARTER_CODES },
  },

  "2": {
    id: "2",
    title: "Add Two Numbers",
    problemType: "MEDIUM",
    description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807.",
      },
      {
        input: "l1 = [0], l2 = [0]",
        output: "[0]",
      },
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros.",
    ],
    testCases: [
      { id: "1", input: "[2,4,3]\n[5,6,4]", expectedOutput: "[7,0,8]" },
      { id: "2", input: "[0]\n[0]", expectedOutput: "[0]" },
      { id: "3", input: "[9,9,9,9,9,9,9]\n[9,9,9,9]", expectedOutput: "[8,9,9,9,0,0,0,1]" },
    ],
    starterCode: { ...DEFAULT_STARTER_CODES },
  },
}

// Generate placeholder data for other problems
for (let i = 3; i <= 15; i++) {
  problemDetails[String(i)] = {
    id: String(i),
    title: `Problem ${i}`,
    problemType: i % 3 === 0 ? "HARD" : i % 2 === 0 ? "MEDIUM" : "EASY",
    description: `This is the description for problem ${i}. Solve this algorithmic challenge to test your skills.

The problem requires you to implement an efficient algorithm that processes the given input and produces the correct output.`,
    examples: [
      {
        input: `n = ${i}`,
        output: `${i * 2}`,
        explanation: `The result is ${i} * 2 = ${i * 2}`,
      },
    ],
    constraints: [
      `1 <= n <= 10^${Math.min(i, 9)}`,
      "Time limit: 1 second",
      "Memory limit: 256 MB",
    ],
    testCases: [
      { id: "1", input: String(i), expectedOutput: String(i * 2) },
      { id: "2", input: String(i + 1), expectedOutput: String((i + 1) * 2) },
      { id: "3", input: String(i + 2), expectedOutput: String((i + 2) * 2) },
    ],
    starterCode: { ...DEFAULT_STARTER_CODES },
  }
}



export const useProblemsStore = create<ProblemsStore>((set) => ({
  filters: initialFilters,
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
  setDifficulty: (difficulty) => set((state) => ({ filters: { ...state.filters, difficulty } })),
  setStatus: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  toggleTag: (tag) =>
    set((state) => ({
      filters: {
        ...state.filters,
        tags: state.filters.tags.includes(tag)
          ? state.filters.tags.filter((t) => t !== tag)
          : [...state.filters.tags, tag],
      },
    })),
  clearFilters: () => set({ filters: initialFilters }),
}))
