package algomarket.problemservice.domain.member;

import static java.util.Objects.requireNonNull;

import algomarket.problemservice.domain.shared.Email;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_member_email", columnNames = "email"),
		@UniqueConstraint(name = "uk_member_username", columnNames = "username")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Embedded
	@AttributeOverride(name = "address", column = @Column(name = "email", unique = true))
	private Email email;

	@Column(nullable = false, length = 20, unique = true)
	private String username;

	@Column(nullable = false, length = 255)
	private String passwordHash;

	public static Member register(MemberRegisterRequest registerRequest, PasswordEncoder passwordEncoder) {
		Member member = new Member();

		member.email = new Email(registerRequest.email());
		member.username = requireNonNull(registerRequest.username());
		member.passwordHash = passwordEncoder.encode(registerRequest.password());

		return member;
	}

	public void authenticate(String password, PasswordEncoder passwordEncoder) {
		if (!passwordEncoder.matches(password, passwordHash)) {
			throw new PasswordMismatchException("비밀번호가 일치하지 않습니다.");
		}
	}

	public void changePassword(String password, PasswordEncoder passwordEncoder) {
		this.passwordHash = passwordEncoder.encode(requireNonNull(password));
	}
}
