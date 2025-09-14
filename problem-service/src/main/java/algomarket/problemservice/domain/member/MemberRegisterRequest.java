package algomarket.problemservice.domain.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemberRegisterRequest(
	@Email String email,
	@NotBlank @Size(min = 3, max = 30) String username,
	@NotBlank @Size(min = 8, max = 100) String password) {
}
