package algomarket.problemservice.application;

import org.springframework.stereotype.Service;

import algomarket.problemservice.domain.member.MemberInfoResponse;
import algomarket.problemservice.application.provided.MemberFinder;
import algomarket.problemservice.application.required.MemberRepository;
import algomarket.problemservice.domain.member.Member;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberQueryService implements MemberFinder {

	private final MemberRepository memberRepository;

	@Override
	public MemberInfoResponse find(String username) {
		Member member = memberRepository.findByUsername(username)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

		return MemberInfoResponse.of(member);
	}
}
