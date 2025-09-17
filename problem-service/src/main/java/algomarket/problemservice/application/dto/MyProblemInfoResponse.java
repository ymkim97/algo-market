package algomarket.problemservice.application.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import algomarket.problemservice.domain.problem.ExampleTestCase;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemStatus;
import algomarket.problemservice.domain.problem.TestCaseUrl;
import algomarket.problemservice.domain.shared.Language;

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

	List<TestCaseUrl> testCaseUrls,

	LocalDateTime lastModified,

	Set <Language> solvedLanguages
) {
	public static MyProblemInfoResponse from (Problem problem) {
		return new MyProblemInfoResponse(problem.getId(), problem.getNumber(), problem.getTitle(), problem.getDescription(),
			problem.getSubmitCount(), problem.getTimeLimitSec(), problem.getMemoryLimitMb(), problem.getProblemStatus(),
			problem.getExampleTestCases(), problem.getTestCaseUrls(), problem.getLastModified(), null);
	}

	public static MyProblemInfoResponse of (Problem problem, Set<Language> solvedLanguages) {
		return new MyProblemInfoResponse(problem.getId(), problem.getNumber(), problem.getTitle(), problem.getDescription(),
			problem.getSubmitCount(), problem.getTimeLimitSec(), problem.getMemoryLimitMb(), problem.getProblemStatus(),
			problem.getExampleTestCases(), problem.getTestCaseUrls(), problem.getLastModified(), solvedLanguages);
	}
}
