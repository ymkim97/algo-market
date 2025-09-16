// Legacy mock data - no longer used
export const mockProblems: any[] = [
  {
    id: 1,
    title: '두 수의 합',
    description: `두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 A와 B가 주어진다. (0 ≤ A, B ≤ 10)

**출력:**
- 첫째 줄에 A+B를 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 1250,
    correctCount: 1100,
    examples: [
      {
        input: '1 2',
        output: '3',
        explanation: '1과 2를 더하면 3이다.',
      },
      {
        input: '5 7',
        output: '12',
      },
    ],
    difficulty: '쉬움',
    tags: ['구현', '사칙연산'],
    isPublic: true,
  },
  {
    id: 2,
    title: '배열의 최댓값',
    description: `N개의 정수가 주어질 때, 이들 중 최댓값을 구하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 정수의 개수 N이 주어진다. (1 ≤ N ≤ 100)
- 둘째 줄에 N개의 정수가 공백으로 구분되어 주어진다. (-1000 ≤ 각 정수 ≤ 1000)

**출력:**
- 첫째 줄에 최댓값을 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 890,
    correctCount: 720,
    examples: [
      {
        input: '5\n3 1 4 1 5',
        output: '5',
        explanation: '주어진 수들 중 가장 큰 값은 5이다.',
      },
      {
        input: '3\n-5 -2 -10',
        output: '-2',
      },
    ],
    difficulty: '쉬움',
    tags: ['구현', '배열'],
    isPublic: true,
  },
  {
    id: 3,
    title: '팩토리얼',
    description: `0보다 크거나 같은 정수 N이 주어진다. 이때, N!을 구하는 프로그램을 작성하시오.

N! = N × (N-1) × (N-2) × ... × 2 × 1이며, 0! = 1로 정의한다.

**제한사항:**
- 첫째 줄에 정수 N이 주어진다. (0 ≤ N ≤ 12)

**출력:**
- 첫째 줄에 N!을 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 650,
    correctCount: 520,
    examples: [
      {
        input: '5',
        output: '120',
        explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120',
      },
      {
        input: '0',
        output: '1',
        explanation: '0!은 정의에 의해 1이다.',
      },
    ],
    difficulty: '쉬움',
    tags: ['수학', '재귀'],
    isPublic: true,
  },
  {
    id: 4,
    title: '이진 탐색',
    description: `정렬된 배열에서 특정 값을 찾는 이진 탐색 알고리즘을 구현하시오.

**제한사항:**
- 첫째 줄에 배열의 크기 N과 찾을 값 K가 주어진다. (1 ≤ N ≤ 100,000, 1 ≤ K ≤ 1,000,000)
- 둘째 줄에 오름차순으로 정렬된 N개의 정수가 주어진다.

**출력:**
- K가 배열에 있으면 그 인덱스(0부터 시작)를, 없으면 -1을 출력한다.`,
    timeLimit: 2,
    memoryLimit: 256,
    submitCount: 420,
    correctCount: 180,
    examples: [
      {
        input: '5 4\n1 2 4 7 9',
        output: '2',
        explanation: '4는 인덱스 2에 위치한다.',
      },
      {
        input: '3 5\n1 2 3',
        output: '-1',
        explanation: '5는 배열에 없다.',
      },
    ],
    difficulty: '중간',
    tags: ['이진탐색', '정렬'],
    isPublic: true,
  },
  {
    id: 5,
    title: '동적 계획법 - 피보나치',
    description: `피보나치 수열의 N번째 항을 구하는 프로그램을 작성하시오.

피보나치 수열은 다음과 같이 정의된다:
- F(0) = 0
- F(1) = 1
- F(n) = F(n-1) + F(n-2) (n ≥ 2)

**제한사항:**
- 첫째 줄에 정수 N이 주어진다. (0 ≤ N ≤ 45)

**출력:**
- 첫째 줄에 F(N)을 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 320,
    correctCount: 95,
    examples: [
      {
        input: '10',
        output: '55',
        explanation: 'F(10) = 55이다.',
      },
      {
        input: '0',
        output: '0',
      },
      {
        input: '1',
        output: '1',
      },
    ],
    difficulty: '어려움',
    tags: ['다이나믹 프로그래밍', '수학'],
    isPublic: true,
  },
  {
    id: 6,
    title: '문자열 뒤집기',
    description: `주어진 문자열을 뒤집어서 출력하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 문자열이 주어진다. (길이는 1 이상 100 이하)
- 문자열은 알파벳 소문자로만 구성된다.

**출력:**
- 첫째 줄에 뒤집힌 문자열을 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 780,
    correctCount: 650,
    examples: [
      {
        input: 'hello',
        output: 'olleh',
      },
      {
        input: 'algorithm',
        output: 'mhtirogla',
      },
    ],
    difficulty: '쉬움',
    tags: ['문자열', '구현'],
    isPublic: true,
  },
  {
    id: 7,
    title: '소수 판별',
    description: `주어진 수가 소수인지 판별하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 자연수 N이 주어진다. (2 ≤ N ≤ 1,000,000)

**출력:**
- N이 소수이면 "YES", 아니면 "NO"를 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 540,
    correctCount: 380,
    examples: [
      {
        input: '7',
        output: 'YES',
        explanation: '7은 소수이다.',
      },
      {
        input: '4',
        output: 'NO',
        explanation: '4는 2로 나누어떨어지므로 소수가 아니다.',
      },
    ],
    difficulty: '중간',
    tags: ['수학', '소수'],
    isPublic: true,
  },
  {
    id: 8,
    title: '버블 정렬',
    description: `버블 정렬 알고리즘을 구현하여 배열을 오름차순으로 정렬하시오.

**제한사항:**
- 첫째 줄에 배열의 크기 N이 주어진다. (1 ≤ N ≤ 1000)
- 둘째 줄에 N개의 정수가 주어진다. (-1000 ≤ 각 정수 ≤ 1000)

**출력:**
- 정렬된 배열을 공백으로 구분하여 출력한다.`,
    timeLimit: 2,
    memoryLimit: 128,
    submitCount: 720,
    correctCount: 650,
    examples: [
      {
        input: '5\n3 1 4 1 5',
        output: '1 1 3 4 5',
      },
      {
        input: '3\n9 2 7',
        output: '2 7 9',
      },
    ],
    difficulty: '쉬움',
    tags: ['정렬', '구현'],
    isPublic: true,
  },
  {
    id: 9,
    title: 'DFS - 깊이 우선 탐색',
    description: `그래프에서 깊이 우선 탐색(DFS)을 수행하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 정점의 개수 N과 간선의 개수 M, 탐색을 시작할 정점의 번호 V가 주어진다.
- 다음 M개의 줄에는 간선이 연결하는 두 정점의 번호가 주어진다.

**출력:**
- DFS를 수행한 결과를 출력한다.`,
    timeLimit: 2,
    memoryLimit: 256,
    submitCount: 380,
    correctCount: 180,
    examples: [
      {
        input: '4 5 1\n1 2\n1 3\n1 4\n2 4\n3 4',
        output: '1 2 4 3',
        explanation: '1번 정점부터 DFS를 시작한다.',
      },
    ],
    difficulty: '어려움',
    tags: ['그래프', 'DFS'],
    isPublic: true,
  },
  {
    id: 10,
    title: '최대공약수 (GCD)',
    description: `두 자연수의 최대공약수를 구하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 두 자연수 A, B가 주어진다. (1 ≤ A, B ≤ 1,000,000)

**출력:**
- A와 B의 최대공약수를 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 890,
    correctCount: 720,
    examples: [
      {
        input: '12 18',
        output: '6',
        explanation: '12와 18의 최대공약수는 6이다.',
      },
      {
        input: '7 3',
        output: '1',
      },
    ],
    difficulty: '쉬움',
    tags: ['수학', '유클리드호제법'],
    isPublic: true,
  },
  {
    id: 11,
    title: '동전 거스름돈',
    description: `주어진 동전들로 특정 금액을 만드는 최소 동전 개수를 구하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 동전의 종류 개수 N과 목표 금액 M이 주어진다.
- 둘째 줄에 N개의 동전 가치가 주어진다.

**출력:**
- 최소 동전 개수를 출력한다. 불가능하면 -1을 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 450,
    correctCount: 180,
    examples: [
      {
        input: '3 11\n1 4 5',
        output: '3',
        explanation: '5 + 5 + 1 = 11 (3개)',
      },
    ],
    difficulty: '어려움',
    tags: ['다이나믹 프로그래밍', '그리디'],
    isPublic: true,
  },
  {
    id: 12,
    title: '회문 판별',
    description: `주어진 문자열이 회문(팰린드롬)인지 판별하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 문자열이 주어진다. (길이는 1 이상 1000 이하)
- 문자열은 알파벳 소문자로만 구성된다.

**출력:**
- 회문이면 "YES", 아니면 "NO"를 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 680,
    correctCount: 520,
    examples: [
      {
        input: 'racecar',
        output: 'YES',
      },
      {
        input: 'hello',
        output: 'NO',
      },
    ],
    difficulty: '쉬움',
    tags: ['문자열', '구현'],
    isPublic: true,
  },
  {
    id: 13,
    title: '괄호 매칭',
    description: `괄호 문자열이 올바르게 매칭되어 있는지 확인하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 괄호 문자열이 주어진다. (길이는 1 이상 100 이하)
- 문자열은 '(', ')', '[', ']', '{', '}' 로만 구성된다.

**출력:**
- 올바른 괄호 문자열이면 "YES", 아니면 "NO"를 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 520,
    correctCount: 340,
    examples: [
      {
        input: '({[]})',
        output: 'YES',
      },
      {
        input: '([)]',
        output: 'NO',
      },
    ],
    difficulty: '중간',
    tags: ['스택', '자료구조'],
    isPublic: true,
  },
  {
    id: 14,
    title: '퀵 정렬',
    description: `퀵 정렬 알고리즘을 구현하여 배열을 정렬하시오.

**제한사항:**
- 첫째 줄에 배열의 크기 N이 주어진다. (1 ≤ N ≤ 100,000)
- 둘째 줄에 N개의 정수가 주어진다.

**출력:**
- 정렬된 배열을 공백으로 구분하여 출력한다.`,
    timeLimit: 2,
    memoryLimit: 256,
    submitCount: 350,
    correctCount: 210,
    examples: [
      {
        input: '5\n3 6 8 10 1',
        output: '1 3 6 8 10',
      },
    ],
    difficulty: '어려움',
    tags: ['정렬', '분할정복'],
    isPublic: true,
  },
  {
    id: 15,
    title: '하노이의 탑',
    description: `하노이의 탑 문제를 해결하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 원판의 개수 N이 주어진다. (1 ≤ N ≤ 20)

**출력:**
- 첫째 줄에 옮긴 횟수를 출력한다.
- 둘째 줄부터 이동 과정을 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 280,
    correctCount: 120,
    examples: [
      {
        input: '3',
        output: '7\n1 3\n1 2\n3 2\n1 3\n2 1\n2 3\n1 3',
        explanation: '3개의 원판을 이동하는데 7번 이동이 필요하다.',
      },
    ],
    difficulty: '어려움',
    tags: ['재귀', '수학'],
    isPublic: true,
  },
  {
    id: 16,
    title: '최장 증가 수열 (LIS)',
    description: `주어진 수열에서 가장 긴 증가하는 부분 수열의 길이를 구하시오.

**제한사항:**
- 첫째 줄에 수열의 크기 N이 주어진다. (1 ≤ N ≤ 1000)
- 둘째 줄에 N개의 정수가 주어진다.

**출력:**
- 가장 긴 증가하는 부분 수열의 길이를 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 320,
    correctCount: 95,
    examples: [
      {
        input: '6\n10 20 10 30 20 50',
        output: '4',
        explanation: '10, 20, 30, 50이 가장 긴 증가 수열이다.',
      },
    ],
    difficulty: '어려움',
    tags: ['다이나믹 프로그래밍', 'LIS'],
    isPublic: true,
  },
  {
    id: 17,
    title: 'BFS - 너비 우선 탐색',
    description: `그래프에서 너비 우선 탐색(BFS)을 수행하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 정점의 개수 N과 간선의 개수 M, 탐색을 시작할 정점의 번호 V가 주어진다.
- 다음 M개의 줄에는 간선이 연결하는 두 정점의 번호가 주어진다.

**출력:**
- BFS를 수행한 결과를 출력한다.`,
    timeLimit: 2,
    memoryLimit: 256,
    submitCount: 420,
    correctCount: 180,
    examples: [
      {
        input: '4 5 1\n1 2\n1 3\n1 4\n2 4\n3 4',
        output: '1 2 3 4',
        explanation: '1번 정점부터 BFS를 시작한다.',
      },
    ],
    difficulty: '어려움',
    tags: ['그래프', 'BFS'],
    isPublic: true,
  },
  {
    id: 18,
    title: '조합 (nCr)',
    description: `n개 중에서 r개를 선택하는 조합의 수를 구하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 n과 r이 주어진다. (0 ≤ r ≤ n ≤ 30)

**출력:**
- nCr을 출력한다.`,
    timeLimit: 1,
    memoryLimit: 128,
    submitCount: 490,
    correctCount: 380,
    examples: [
      {
        input: '5 2',
        output: '10',
        explanation: '5C2 = 10이다.',
      },
      {
        input: '4 0',
        output: '1',
      },
    ],
    difficulty: '중간',
    tags: ['수학', '조합론'],
    isPublic: true,
  },
  {
    id: 19,
    title: '이진 트리 순회',
    description: `이진 트리의 전위, 중위, 후위 순회 결과를 출력하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 노드의 개수 N이 주어진다. (1 ≤ N ≤ 26)
- 다음 N개의 줄에 각 노드와 그의 왼쪽 자식 노드, 오른쪽 자식 노드가 주어진다.

**출력:**
- 첫째 줄에 전위 순회, 둘째 줄에 중위 순회, 셋째 줄에 후위 순회 한 결과를 출력한다.`,
    timeLimit: 2,
    memoryLimit: 128,
    submitCount: 280,
    correctCount: 150,
    examples: [
      {
        input: '7\nA B C\nB D .\nC E F\nE . .\nF . G\nD . .\nG . .',
        output: 'ABDCEFG\nDBAECFG\nDBEGFCA',
      },
    ],
    difficulty: '어려움',
    tags: ['트리', '순회'],
    isPublic: true,
  },
  {
    id: 20,
    title: '배낭 문제',
    description: `0/1 배낭 문제를 해결하는 프로그램을 작성하시오.

**제한사항:**
- 첫째 줄에 물건의 수 N과 배낭의 무게 W가 주어진다.
- 다음 N개의 줄에 각 물건의 무게와 가치가 주어진다.

**출력:**
- 배낭에 넣을 수 있는 물건들의 가치합의 최댓값을 출력한다.`,
    timeLimit: 2,
    memoryLimit: 256,
    submitCount: 180,
    correctCount: 45,
    examples: [
      {
        input: '4 7\n6 13\n4 8\n3 6\n5 12',
        output: '14',
        explanation: '무게 3인 물건(가치6)과 무게 4인 물건(가치8)을 선택한다.',
      },
    ],
    difficulty: '어려움',
    tags: ['다이나믹 프로그래밍', '배낭문제'],
    isPublic: true,
  },
];

export const getMockProblems = (): Promise<any[]> => {
  return new Promise((resolve) => {
    // API 호출을 시뮬레이션하기 위한 지연
    setTimeout(() => {
      resolve(mockProblems);
    }, 800);
  });
};

export const getMockProblem = (id: number): Promise<any | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const problem = mockProblems.find((p) => p.id === id);
      resolve(problem || null);
    }, 500);
  });
};
