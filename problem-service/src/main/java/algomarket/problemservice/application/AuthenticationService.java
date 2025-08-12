package algomarket.problemservice.application;

import org.springframework.stereotype.Service;

import algomarket.problemservice.application.dto.LoginRequest;
import algomarket.problemservice.application.provided.AuthenticationHandler;
import algomarket.problemservice.application.required.MemberRepository;
import algomarket.problemservice.application.required.TokenProvider;
import algomarket.problemservice.domain.member.Member;
import algomarket.problemservice.domain.member.PasswordEncoder;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService implements AuthenticationHandler {

	private final MemberRepository memberRepository;
	private final TokenProvider tokenProvider;
	private final PasswordEncoder passwordEncoder;

	@Override
	public String login(LoginRequest loginRequest) {
		Member member = memberRepository.findByUsername(loginRequest.username())
			.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

		member.authenticate(loginRequest.password(), passwordEncoder);

		return tokenProvider.createToken(member.getUsername());
	}
}
