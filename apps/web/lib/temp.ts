
import { create } from "zustand";

type Filters = {
  search: string
  difficulty: "Easy" | "Medium" | "Hard" | null
  status: "solved" | "attempted" | "unsolved" | null
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
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  status: "solved" | "attempted" | "unsolved"
}

export const problems: Problem[] = [
  {
    id: "1",
    serialNumber: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    status: "solved",
  },
  {
    id: "2",
    serialNumber: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    tags: ["Linked List", "Math", "Recursion"],
    status: "attempted",
  },
  {
    id: "3",
    serialNumber: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    status: "unsolved",
  },
  {
    id: "4",
    serialNumber: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    status: "unsolved",
  },
  {
    id: "5",
    serialNumber: 5,
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    status: "solved",
  },
  {
    id: "6",
    serialNumber: 6,
    title: "Zigzag Conversion",
    difficulty: "Medium",
    tags: ["String"],
    status: "unsolved",
  },
  {
    id: "7",
    serialNumber: 7,
    title: "Reverse Integer",
    difficulty: "Easy",
    tags: ["Math"],
    status: "solved",
  },
  {
    id: "8",
    serialNumber: 8,
    title: "String to Integer (atoi)",
    difficulty: "Medium",
    tags: ["String"],
    status: "attempted",
  },
  {
    id: "9",
    serialNumber: 9,
    title: "Palindrome Number",
    difficulty: "Easy",
    tags: ["Math"],
    status: "solved",
  },
  {
    id: "10",
    serialNumber: 10,
    title: "Regular Expression Matching",
    difficulty: "Hard",
    tags: ["String", "Dynamic Programming", "Recursion"],
    status: "unsolved",
  },
  {
    id: "11",
    serialNumber: 11,
    title: "Container With Most Water",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy"],
    status: "unsolved",
  },
  {
    id: "12",
    serialNumber: 12,
    title: "Integer to Roman",
    difficulty: "Medium",
    tags: ["Hash Table", "Math", "String"],
    status: "solved",
  },
  {
    id: "13",
    serialNumber: 13,
    title: "Roman to Integer",
    difficulty: "Easy",
    tags: ["Hash Table", "Math", "String"],
    status: "solved",
  },
  {
    id: "14",
    serialNumber: 14,
    title: "Longest Common Prefix",
    difficulty: "Easy",
    tags: ["String", "Trie"],
    status: "attempted",
  },
  {
    id: "15",
    serialNumber: 15,
    title: "3Sum",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    status: "unsolved",
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
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
  constraints: string[]
  testCases: TestCase[]
  starterCode: {
    cpp: string
    python: string
    java: string
    javascript: string
  }
}

export const problemDetails: Record<string, ProblemDetail> = {
  "1": {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
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
    starterCode: {
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};`,
    },
  },
  "2": {
    id: "2",
    title: "Add Two Numbers",
    difficulty: "Medium",
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
    starterCode: {
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        // Your code here
    }
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # Your code here
        pass`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // Your code here
    }
}`,
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    // Your code here
};`,
    },
  },
}

// Generate placeholder data for other problems
for (let i = 3; i <= 15; i++) {
  problemDetails[String(i)] = {
    id: String(i),
    title: `Problem ${i}`,
    difficulty: i % 3 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy",
    description: `This is the description for problem ${i}. Solve this algorithmic challenge to test your skills.

The problem requires you to implement an efficient algorithm that processes the given input and produces the correct output.`,
    examples: [
      {
        input: `n = ${i}`,
        output: `${i * 2}`,
        explanation: `The result is ${i} * 2 = ${i * 2}`,
      },
    ],
    constraints: [`1 <= n <= 10^${Math.min(i, 9)}`, "Time limit: 1 second", "Memory limit: 256 MB"],
    testCases: [
      { id: "1", input: String(i), expectedOutput: String(i * 2) },
      { id: "2", input: String(i + 1), expectedOutput: String((i + 1) * 2) },
      { id: "3", input: String(i + 2), expectedOutput: String((i + 2) * 2) },
    ],
    starterCode: {
      cpp: `class Solution {
public:
    int solve(int n) {
        // Your code here
    }
};`,
      python: `class Solution:
    def solve(self, n: int) -> int:
        # Your code here
        pass`,
      java: `class Solution {
    public int solve(int n) {
        // Your code here
    }
}`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
var solve = function(n) {
    // Your code here
};`,
    },
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
