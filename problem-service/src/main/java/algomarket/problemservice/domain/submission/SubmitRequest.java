package algomarket.problemservice.domain.submission;

import algomarket.problemservice.domain.shared.annotation.MaxBytes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SubmitRequest(
	@NotNull @Positive Long problemId,

	@NotBlank @MaxBytes(max = 262_144, charset = "UTF-8") String sourceCode,

	@NotNull Language language
) {

}
