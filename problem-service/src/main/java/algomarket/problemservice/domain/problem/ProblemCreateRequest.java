package algomarket.problemservice.domain.problem;

import java.util.List;

import algomarket.problemservice.domain.shared.annotation.MemoryLimit;
import algomarket.problemservice.domain.shared.annotation.TimeLimit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProblemCreateRequest(
	@NotBlank @Size(max = 100) String title,

	@NotBlank String description,

	@NotNull @Positive @TimeLimit Double timeLimitSec,

	@NotNull @Positive @MemoryLimit Integer memoryLimitMb,

	List<ExampleTestCase> exampleTestCases,

	@NotNull @Size(min = 10, message = "문제는 최소 10개 이상의 각각 입력, 출력 채점용 데이터가 필요합니다.") List<TestCaseUrl> testCaseUrls
) {
}
