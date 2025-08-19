package algomarket.problemservice.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InitiateUploadRequest(
	@NotBlank String originalFileName,

	@Positive @NotNull @Max(1000000) Integer fileSizeKiloBytes,

	@Positive @NotNull Long problemId
) {
}
