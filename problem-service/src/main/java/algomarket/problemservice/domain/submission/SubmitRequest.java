package algomarket.problemservice.domain.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SubmitRequest(
	@NotNull @Positive Long problemId,

	@NotBlank @Size(max = 262_144, message = "소스 코드는 최대 256KB까지 허용됩니다.") String sourceCode,

	@NotNull Language language
) {

}
