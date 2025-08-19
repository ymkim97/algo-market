package algomarket.problemservice.application.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
	@NotBlank String username,

	@NotBlank String password
) {
}
