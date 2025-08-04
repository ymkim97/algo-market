package algomarket.problemservice.domain.problem;

public class ProblemFixture {

	public static ProblemCreateRequest createProblemCreateRequest() {
		return createProblemCreateRequest(1.0, 512);
	}

	public static ProblemCreateRequest createProblemCreateRequest(Double timeLimit, Integer memoryLimit) {
		return createProblemCreateRequest("Title", timeLimit, memoryLimit);
	}

	public static ProblemCreateRequest createProblemCreateRequest(String title, Double timeLimit, Integer memoryLimit) {
		return new ProblemCreateRequest(title, "Description", timeLimit, memoryLimit);
	}
}
