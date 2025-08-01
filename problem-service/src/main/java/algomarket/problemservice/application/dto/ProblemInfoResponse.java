package algomarket.problemservice.application.dto;

import algomarket.problemservice.domain.problem.Problem;

public record ProblemInfoResponse(
	Long id,

	String title,

	String description,

	Integer submitCount,

	Double timeLimit,

	Integer memoryLimit
) {
	public static ProblemInfoResponse of(Problem problem) {
		return new ProblemInfoResponse(problem.getId(), problem.getTitle(), problem.getDescription(), problem.getSubmitCount(),
			problem.getTimeLimit(), problem.getMemoryLimit());
	}
}
