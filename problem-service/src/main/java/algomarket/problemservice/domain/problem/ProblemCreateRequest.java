package algomarket.problemservice.domain.problem;

import java.util.List;

import algomarket.problemservice.domain.shared.annotation.MemoryLimit;
import algomarket.problemservice.domain.shared.annotation.TimeLimit;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProblemCreateRequest(
	String title,

	String description,

	@NotNull @Positive @TimeLimit Double timeLimitSec,

	@NotNull @Positive @MemoryLimit Integer memoryLimitMb,

	List<ExampleTestCase> exampleTestCases,

	List<TestCaseUrl> testCaseUrls
) {
}
