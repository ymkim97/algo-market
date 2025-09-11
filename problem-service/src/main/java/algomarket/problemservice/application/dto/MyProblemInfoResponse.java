package algomarket.problemservice.application.dto;

import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemStatus;

public record MyProblemInfoResponse(
	Long problemId,

	Long problemNumber,

	String title,

	String description,

	Integer submitCount,

	Double timeLimit,

	Integer memoryLimit,

	ProblemStatus problemStatus
) {
	public static MyProblemInfoResponse from (Problem problem) {
		return new MyProblemInfoResponse(problem.getId(), problem.getNumber(), problem.getTitle(), problem.getDescription(),
			problem.getSubmitCount(), problem.getTimeLimitSec(), problem.getMemoryLimitMb(), problem.getProblemStatus());
	}
}
