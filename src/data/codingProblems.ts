import { Problem } from '@/types/codingPractice';

export const codingProblems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    functionSignature: 'function twoSum(nums: number[], target: number): number[]',
    starterCode: `function twoSum(nums, target) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function twoSum(nums, target) {
  // Your code here
  
}`,
        functionName: 'twoSum',
      },
      python: {
        starterCode: `def two_sum(nums, target):
    # Your code here
    pass`,
        functionName: 'two_sum',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
        expectedOutput: JSON.stringify([0, 1]),
        isHidden: false,
        description: 'Basic case',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
        expectedOutput: JSON.stringify([1, 2]),
        isHidden: false,
        description: 'Middle elements',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ nums: [3, 3], target: 6 }),
        expectedOutput: JSON.stringify([0, 1]),
        isHidden: false,
        description: 'Same numbers',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ nums: [1, 5, 8, 3, 9, 2], target: 11 }),
        expectedOutput: JSON.stringify([2, 3]),
        isHidden: true,
        description: 'Hidden test 1',
      },
      {
        id: 'tc5',
        input: JSON.stringify({ nums: [-1, -2, -3, -4, -5], target: -8 }),
        expectedOutput: JSON.stringify([2, 4]),
        isHidden: true,
        description: 'Negative numbers',
      },
    ],
    hints: [
      { id: 1, text: 'Try using a hash map to store the numbers you\'ve seen.', xpCost: 5 },
      { id: 2, text: 'For each number, check if (target - number) exists in your hash map.', xpCost: 5 },
      { id: 3, text: 'The time complexity can be O(n) with the right approach.', xpCost: 5 },
    ],
    tags: ['Arrays', 'HashMap'],
    relatedRoadmapIds: ['frontend-developer', 'backend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with O(1) extra memory.`,
    examples: [
      {
        input: 's = ["h", "e", "l", "l", "o"]',
        output: '["o", "l", "l", "e", "h"]',
      },
      {
        input: 's = ["H", "a", "n", "n", "a", "h"]',
        output: '["h", "a", "n", "n", "a", "H"]',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ASCII character.',
    ],
    functionSignature: 'function reverseString(s: string[]): void',
    starterCode: `function reverseString(s) {
  // Modify s in-place
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function reverseString(s) {
  // Modify s in-place
  
}`,
        functionName: 'reverseString',
      },
      python: {
        starterCode: `def reverse_string(s):
    # Modify s in-place and return it
    pass`,
        functionName: 'reverse_string',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ s: ['h', 'e', 'l', 'l', 'o'] }),
        expectedOutput: JSON.stringify(['o', 'l', 'l', 'e', 'h']),
        isHidden: false,
        description: 'Basic word',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ s: ['H', 'a', 'n', 'n', 'a', 'h'] }),
        expectedOutput: JSON.stringify(['h', 'a', 'n', 'n', 'a', 'H']),
        isHidden: false,
        description: 'Palindrome name',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ s: ['a'] }),
        expectedOutput: JSON.stringify(['a']),
        isHidden: true,
        description: 'Single character',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ s: ['a', 'b'] }),
        expectedOutput: JSON.stringify(['b', 'a']),
        isHidden: true,
        description: 'Two characters',
      },
    ],
    hints: [
      { id: 1, text: 'Use two pointers - one at the start and one at the end.', xpCost: 5 },
      { id: 2, text: 'Swap the characters at the two pointers and move them towards each other.', xpCost: 5 },
    ],
    tags: ['Strings'],
    relatedRoadmapIds: ['frontend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'fizz-buzz',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    description: `Given an integer \`n\`, return a string array \`answer\` (1-indexed) where:

- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.
- \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.
- \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.
- \`answer[i] == i\` (as a string) if none of the above conditions are true.`,
    examples: [
      {
        input: 'n = 3',
        output: '["1", "2", "Fizz"]',
      },
      {
        input: 'n = 5',
        output: '["1", "2", "Fizz", "4", "Buzz"]',
      },
      {
        input: 'n = 15',
        output: '["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]',
      },
    ],
    constraints: ['1 <= n <= 10^4'],
    functionSignature: 'function fizzBuzz(n: number): string[]',
    starterCode: `function fizzBuzz(n) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function fizzBuzz(n) {
  // Your code here
  
}`,
        functionName: 'fizzBuzz',
      },
      python: {
        starterCode: `def fizz_buzz(n):
    # Your code here
    pass`,
        functionName: 'fizz_buzz',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ n: 3 }),
        expectedOutput: JSON.stringify(['1', '2', 'Fizz']),
        isHidden: false,
        description: 'n = 3',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ n: 5 }),
        expectedOutput: JSON.stringify(['1', '2', 'Fizz', '4', 'Buzz']),
        isHidden: false,
        description: 'n = 5',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ n: 15 }),
        expectedOutput: JSON.stringify(['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']),
        isHidden: false,
        description: 'n = 15 (includes FizzBuzz)',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ n: 1 }),
        expectedOutput: JSON.stringify(['1']),
        isHidden: true,
        description: 'Minimum input',
      },
    ],
    hints: [
      { id: 1, text: 'Loop from 1 to n and check divisibility conditions.', xpCost: 5 },
      { id: 2, text: 'Check for divisibility by both 3 and 5 first, before checking individually.', xpCost: 5 },
    ],
    tags: ['Math', 'Logic'],
    relatedRoadmapIds: ['frontend-developer', 'backend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'palindrome-check',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.',
      },
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.',
    ],
    functionSignature: 'function isPalindrome(s: string): boolean',
    starterCode: `function isPalindrome(s) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function isPalindrome(s) {
  // Your code here
  
}`,
        functionName: 'isPalindrome',
      },
      python: {
        starterCode: `def is_palindrome(s):
    # Your code here
    pass`,
        functionName: 'is_palindrome',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ s: 'A man, a plan, a canal: Panama' }),
        expectedOutput: JSON.stringify(true),
        isHidden: false,
        description: 'Classic palindrome',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ s: 'race a car' }),
        expectedOutput: JSON.stringify(false),
        isHidden: false,
        description: 'Not a palindrome',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ s: ' ' }),
        expectedOutput: JSON.stringify(true),
        isHidden: false,
        description: 'Empty after cleanup',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ s: 'Was it a car or a cat I saw?' }),
        expectedOutput: JSON.stringify(true),
        isHidden: true,
        description: 'Another palindrome',
      },
    ],
    hints: [
      { id: 1, text: 'First, clean the string by removing non-alphanumeric characters and converting to lowercase.', xpCost: 5 },
      { id: 2, text: 'You can use two pointers from both ends or simply compare the string with its reverse.', xpCost: 5 },
    ],
    tags: ['Strings'],
    relatedRoadmapIds: ['frontend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'find-maximum',
    title: 'Find Maximum in Array',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\`, return the maximum element in the array.`,
    examples: [
      {
        input: 'nums = [3, 1, 4, 1, 5, 9, 2, 6]',
        output: '9',
      },
      {
        input: 'nums = [-1, -5, -3]',
        output: '-1',
      },
      {
        input: 'nums = [42]',
        output: '42',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
    ],
    functionSignature: 'function findMax(nums: number[]): number',
    starterCode: `function findMax(nums) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function findMax(nums) {
  // Your code here
  
}`,
        functionName: 'findMax',
      },
      python: {
        starterCode: `def find_max(nums):
    # Your code here
    pass`,
        functionName: 'find_max',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ nums: [3, 1, 4, 1, 5, 9, 2, 6] }),
        expectedOutput: JSON.stringify(9),
        isHidden: false,
        description: 'Basic array',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ nums: [-1, -5, -3] }),
        expectedOutput: JSON.stringify(-1),
        isHidden: false,
        description: 'Negative numbers',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ nums: [42] }),
        expectedOutput: JSON.stringify(42),
        isHidden: false,
        description: 'Single element',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ nums: [0, 0, 0, 1, 0, 0] }),
        expectedOutput: JSON.stringify(1),
        isHidden: true,
        description: 'Mostly zeros',
      },
    ],
    hints: [
      { id: 1, text: 'You can use Math.max() with the spread operator, or iterate through the array.', xpCost: 5 },
      { id: 2, text: 'Initialize max with the first element or negative infinity.', xpCost: 5 },
    ],
    tags: ['Arrays'],
    relatedRoadmapIds: ['frontend-developer', 'backend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
      {
        input: 's = "([)]"',
        output: 'false',
      },
      {
        input: 's = "{[]}"',
        output: 'true',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.', 
    ],
    functionSignature: 'function isValid(s: string): boolean',
    starterCode: `function isValid(s) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function isValid(s) {
  // Your code here
  
}`,
        functionName: 'isValid',
      },
      python: {
        starterCode: `def is_valid(s):
    # Your code here
    pass`,
        functionName: 'is_valid',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ s: '()' }),
        expectedOutput: JSON.stringify(true),
        isHidden: false,
        description: 'Simple pair',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ s: '()[]{}' }),
        expectedOutput: JSON.stringify(true),
        isHidden: false,
        description: 'All types',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ s: '(]' }),
        expectedOutput: JSON.stringify(false),
        isHidden: false,
        description: 'Mismatched',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ s: '([)]' }),
        expectedOutput: JSON.stringify(false),
        isHidden: false,
        description: 'Wrong order',
      },
      {
        id: 'tc5',
        input: JSON.stringify({ s: '{[]}' }),
        expectedOutput: JSON.stringify(true),
        isHidden: false,
        description: 'Nested',
      },
      {
        id: 'tc6',
        input: JSON.stringify({ s: '(((())))' }),
        expectedOutput: JSON.stringify(true),
        isHidden: true,
        description: 'Deep nesting',
      },
    ],
    hints: [
      { id: 1, text: 'Use a stack to keep track of opening brackets.', xpCost: 5 },
      { id: 2, text: 'When you see a closing bracket, check if it matches the top of the stack.', xpCost: 5 },
      { id: 3, text: 'At the end, the stack should be empty for a valid string.', xpCost: 5 },
    ],
    tags: ['Stack', 'Strings'],
    relatedRoadmapIds: ['frontend-developer', 'backend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'merge-sorted-arrays',
    title: 'Merge Sorted Arrays',
    difficulty: 'Medium',
    description: `You are given two integer arrays \`nums1\` and \`nums2\`, sorted in **non-decreasing order**, and two integers \`m\` and \`n\`, representing the number of elements in \`nums1\` and \`nums2\` respectively.

**Merge** \`nums1\` and \`nums2\` into a single array sorted in **non-decreasing order**.

The final sorted array should not be returned by the function, but instead be stored inside the array \`nums1\`. To accommodate this, \`nums1\` has a length of \`m + n\`, where the first \`m\` elements denote the elements that should be merged, and the last \`n\` elements are set to \`0\` and should be ignored. \`nums2\` has a length of \`n\`.`,
    examples: [
      {
        input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3',
        output: '[1,2,2,3,5,6]',
        explanation: 'The arrays we are merging are [1,2,3] and [2,5,6]. The result is [1,2,2,3,5,6].',
      },
      {
        input: 'nums1 = [1], m = 1, nums2 = [], n = 0',
        output: '[1]',
        explanation: 'The arrays we are merging are [1] and []. The result is [1].',
      },
    ],
    constraints: [
      'nums1.length == m + n',
      'nums2.length == n',
      '0 <= m, n <= 200',
      '1 <= m + n <= 200',
      '-10^9 <= nums1[i], nums2[j] <= 10^9',
    ],
    functionSignature: 'function merge(nums1: number[], m: number, nums2: number[], n: number): void',
    starterCode: `function merge(nums1, m, nums2, n) {
  // Modify nums1 in-place
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function merge(nums1, m, nums2, n) {
  // Modify nums1 in-place
  
}`,
        functionName: 'merge',
      },
      python: {
        starterCode: `def merge(nums1, m, nums2, n):
    # Modify nums1 in-place and return it
    pass`,
        functionName: 'merge',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }),
        expectedOutput: JSON.stringify([1, 2, 2, 3, 5, 6]),
        isHidden: false,
        description: 'Basic merge',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ nums1: [1], m: 1, nums2: [], n: 0 }),
        expectedOutput: JSON.stringify([1]),
        isHidden: false,
        description: 'Empty nums2',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ nums1: [0], m: 0, nums2: [1], n: 1 }),
        expectedOutput: JSON.stringify([1]),
        isHidden: true,
        description: 'Empty nums1',
      },
    ],
    hints: [
      { id: 1, text: 'Start from the end of both arrays and work backwards.', xpCost: 5 },
      { id: 2, text: 'Use three pointers: one for nums1 elements, one for nums2, and one for the merge position.', xpCost: 5 },
      { id: 3, text: 'Compare elements and place the larger one at the current merge position.', xpCost: 5 },
    ],
    tags: ['Arrays', 'Sorting'],
    relatedRoadmapIds: ['backend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Medium',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4.',
      },
      {
        input: 'nums = [-1,0,3,5,9,12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    functionSignature: 'function search(nums: number[], target: number): number',
    starterCode: `function search(nums, target) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function search(nums, target) {
  // Your code here
  
}`,
        functionName: 'search',
      },
      python: {
        starterCode: `def search(nums, target):
    # Your code here
    pass`,
        functionName: 'search',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ nums: [-1, 0, 3, 5, 9, 12], target: 9 }),
        expectedOutput: JSON.stringify(4),
        isHidden: false,
        description: 'Target exists',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ nums: [-1, 0, 3, 5, 9, 12], target: 2 }),
        expectedOutput: JSON.stringify(-1),
        isHidden: false,
        description: 'Target does not exist',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ nums: [5], target: 5 }),
        expectedOutput: JSON.stringify(0),
        isHidden: true,
        description: 'Single element, found',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ nums: [2, 5], target: 5 }),
        expectedOutput: JSON.stringify(1),
        isHidden: true,
        description: 'Two elements',
      },
    ],
    hints: [
      { id: 1, text: 'Use two pointers for left and right boundaries.', xpCost: 5 },
      { id: 2, text: 'Calculate the middle index and compare with target.', xpCost: 5 },
      { id: 3, text: 'Narrow down the search space by half each iteration.', xpCost: 5 },
    ],
    tags: ['Searching', 'Arrays'],
    relatedRoadmapIds: ['backend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Number',
    difficulty: 'Medium',
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`. That is,

\`\`\`
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.
\`\`\`

Given \`n\`, calculate \`F(n)\`.`,
    examples: [
      {
        input: 'n = 2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.',
      },
      {
        input: 'n = 3',
        output: '2',
        explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.',
      },
      {
        input: 'n = 4',
        output: '3',
        explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.',
      },
    ],
    constraints: ['0 <= n <= 30'],
    functionSignature: 'function fib(n: number): number',
    starterCode: `function fib(n) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function fib(n) {
  // Your code here
  
}`,
        functionName: 'fib',
      },
      python: {
        starterCode: `def fib(n):
    # Your code here
    pass`,
        functionName: 'fib',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ n: 2 }),
        expectedOutput: JSON.stringify(1),
        isHidden: false,
        description: 'F(2)',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ n: 3 }),
        expectedOutput: JSON.stringify(2),
        isHidden: false,
        description: 'F(3)',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ n: 4 }),
        expectedOutput: JSON.stringify(3),
        isHidden: false,
        description: 'F(4)',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ n: 0 }),
        expectedOutput: JSON.stringify(0),
        isHidden: true,
        description: 'F(0)',
      },
      {
        id: 'tc5',
        input: JSON.stringify({ n: 10 }),
        expectedOutput: JSON.stringify(55),
        isHidden: true,
        description: 'F(10)',
      },
    ],
    hints: [
      { id: 1, text: 'You can solve this recursively, but it may be slow for larger n.', xpCost: 5 },
      { id: 2, text: 'Consider using dynamic programming or iteration for efficiency.', xpCost: 5 },
      { id: 3, text: 'You only need to keep track of the last two Fibonacci numbers.', xpCost: 5 },
    ],
    tags: ['DynamicProgramming', 'Recursion', 'Math'],
    relatedRoadmapIds: ['backend-developer'],
    timeLimit: 5000,
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.',
      },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    functionSignature: 'function lengthOfLongestSubstring(s: string): number',
    starterCode: `function lengthOfLongestSubstring(s) {
  // Your code here
  
}`,
    supportedLanguages: ['javascript', 'python'],
    languageCode: {
      javascript: {
        starterCode: `function lengthOfLongestSubstring(s) {
  // Your code here
  
}`,
        functionName: 'lengthOfLongestSubstring',
      },
      python: {
        starterCode: `def length_of_longest_substring(s):
    # Your code here
    pass`,
        functionName: 'length_of_longest_substring',
      },
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify({ s: 'abcabcbb' }),
        expectedOutput: JSON.stringify(3),
        isHidden: false,
        description: 'Basic case',
      },
      {
        id: 'tc2',
        input: JSON.stringify({ s: 'bbbbb' }),
        expectedOutput: JSON.stringify(1),
        isHidden: false,
        description: 'All same characters',
      },
      {
        id: 'tc3',
        input: JSON.stringify({ s: 'pwwkew' }),
        expectedOutput: JSON.stringify(3),
        isHidden: false,
        description: 'Mixed',
      },
      {
        id: 'tc4',
        input: JSON.stringify({ s: '' }),
        expectedOutput: JSON.stringify(0),
        isHidden: true,
        description: 'Empty string',
      },
      {
        id: 'tc5',
        input: JSON.stringify({ s: 'abcdefg' }),
        expectedOutput: JSON.stringify(7),
        isHidden: true,
        description: 'All unique',
      },
    ],
    hints: [
      { id: 1, text: 'Use the sliding window technique.', xpCost: 5 },
      { id: 2, text: 'Keep a set or map to track characters in the current window.', xpCost: 5 },
      { id: 3, text: 'When you find a repeat, shrink the window from the left.', xpCost: 5 },
    ],
    tags: ['Strings', 'HashMap'],
    relatedRoadmapIds: ['frontend-developer', 'backend-developer'],
    timeLimit: 5000,
  },
];

// Helper function to get problem by ID
export const getProblemById = (id: string): Problem | undefined => {
  return codingProblems.find(problem => problem.id === id);
};

// Helper function to filter problems
export const filterProblems = (
  difficulty?: string[],
  categories?: string[],
  search?: string
): Problem[] => {
  return codingProblems.filter(problem => {
    if (difficulty && difficulty.length > 0 && !difficulty.includes(problem.difficulty)) {
      return false;
    }
    if (categories && categories.length > 0 && !problem.tags.some(tag => categories.includes(tag))) {
      return false;
    }
    if (search && !problem.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });
};

// Get problems by difficulty
export const getProblemsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): Problem[] => {
  return codingProblems.filter(problem => problem.difficulty === difficulty);
};

// Get problems by category
export const getProblemsByCategory = (category: string): Problem[] => {
  return codingProblems.filter(problem => problem.tags.includes(category as any));
};
