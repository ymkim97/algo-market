package algomarket.problemservice.domain.member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MemberTest {

	Member member;
	PasswordEncoder passwordEncoder = MemberFixture.createPasswordEncoder();

	@BeforeEach
	void setUp() {
		member = Member.register(MemberFixture.createMemberRegisterRequest(), passwordEncoder);
	}

	@Test
	void register() {
		assertThat(member).isNotNull();
	}

	@Test
	void register_withNullEmail() {
		Member.register(MemberFixture.createMemberRegisterRequest(null), passwordEncoder);
	}

	@Test
	void register_withInvalidEmail_fail() {
		assertThatThrownBy(() -> Member.register(MemberFixture.createMemberRegisterRequest("Invalid Email"), passwordEncoder))
		    .isInstanceOf(IllegalArgumentException.class);
	}

	@Test
	void authenticate() {
		member.authenticate("password", passwordEncoder);
		assertThatThrownBy(() -> member.authenticate("Wrong password", passwordEncoder))
		    .isInstanceOf(PasswordMismatchException.class);
	}

	@Test
	void changePassword() {
		String newPassword = "newPassword";

		member.changePassword(newPassword, passwordEncoder);

		assertThat(member.getPasswordHash()).isEqualTo(passwordEncoder.encode(newPassword));
	}
}
