package algomarket.problemservice.application.dto;

import java.util.List;

import algomarket.problemservice.domain.problem.ExampleTestCase;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemStatus;
import algomarket.problemservice.domain.problem.TestCaseUrl;

public record MyProblemInfoResponse(
	Long problemId,

	Long problemNumber,

	String title,

	String description,

	Integer submitCount,

	Double timeLimit,

	Integer memoryLimit,

	ProblemStatus problemStatus,

	List<ExampleTestCase> exampleTestCases,

	List<TestCaseUrl> testCaseUrls
) {
	public static MyProblemInfoResponse from (Problem problem) {
		return new MyProblemInfoResponse(problem.getId(), problem.getNumber(), problem.getTitle(), problem.getDescription(),
			problem.getSubmitCount(), problem.getTimeLimitSec(), problem.getMemoryLimitMb(), problem.getProblemStatus(),
			problem.getExampleTestCases(), problem.getTestCaseUrls());
	}
}
