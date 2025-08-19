package algomarket.problemservice.domain.member;

public record MemberInfoResponse(
	Long memberId,

	String email,

	String username
) {
	public static MemberInfoResponse of(Member member) {
		return new MemberInfoResponse(member.getId(),
			member.getEmail() != null ?  member.getEmail().address() : null,
			member.getUsername()
		);
	}
}
