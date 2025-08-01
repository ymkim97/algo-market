package algomarket.problemservice.domain;

import algomarket.problemservice.domain.problem.ProblemCreateRequest;

public class ProblemFixture {

	public static ProblemCreateRequest createProblemCreateRequest() {
		return createProblemCreateRequest(1.0, 512);
	}

	public static ProblemCreateRequest createProblemCreateRequest(String title) {
		return createProblemCreateRequest(title, 1.0, 512);
	}

	public static ProblemCreateRequest createProblemCreateRequest(Double timeLimit, Integer memoryLimit) {
		return createProblemCreateRequest("Title", timeLimit, memoryLimit);
	}

	public static ProblemCreateRequest createProblemCreateRequest(String title, Double timeLimit, Integer memoryLimit) {
		return new ProblemCreateRequest(title, "Description", timeLimit, memoryLimit);
	}
}
