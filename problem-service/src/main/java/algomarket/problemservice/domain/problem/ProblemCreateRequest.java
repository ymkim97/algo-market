package algomarket.problemservice.domain.problem;

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

	@NotNull @Positive @MemoryLimit Integer memoryLimitMb
) {
}
