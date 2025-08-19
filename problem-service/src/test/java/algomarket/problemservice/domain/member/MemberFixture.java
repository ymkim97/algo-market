package algomarket.problemservice.domain.member;

public class MemberFixture {

	public static MemberRegisterRequest createMemberRegisterRequest() {
		return createMemberRegisterRequest("young@gmail.com");
	}

	public static MemberRegisterRequest createMemberRegisterRequest(String email) {
		return createMemberRegisterRequest(email, "zero");
	}

	public static MemberRegisterRequest createMemberRegisterRequest(String email, String username) {
		return new MemberRegisterRequest(email, username, "password");
	}

	public static PasswordEncoder createPasswordEncoder() {
		return new PasswordEncoder() {
			@Override
			public String encode(String password) {
				return "Hashed" + password.toUpperCase();
			}

			@Override
			public boolean matches(String password, String passwordHash) {
				return encode(password).equals(passwordHash);
			}
		};
	}
}
