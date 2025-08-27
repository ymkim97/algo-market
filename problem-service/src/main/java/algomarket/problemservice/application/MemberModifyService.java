package algomarket.problemservice.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.domain.member.MemberInfoResponse;
import algomarket.problemservice.application.provided.MemberRegister;
import algomarket.problemservice.application.required.MemberRepository;
import algomarket.problemservice.domain.member.DuplicateEmailException;
import algomarket.problemservice.domain.member.DuplicateUsernameException;
import algomarket.problemservice.domain.member.Member;
import algomarket.problemservice.domain.member.MemberRegisterRequest;
import algomarket.problemservice.domain.member.PasswordEncoder;
import algomarket.problemservice.domain.shared.Email;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberModifyService implements MemberRegister {

	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	@Transactional
	public MemberInfoResponse register(MemberRegisterRequest request) {
		checkEmailDuplicate(request.email());
		checkUsernameDuplicate(request.username());

		Member member = Member.register(request, passwordEncoder);

		return MemberInfoResponse.from(memberRepository.save(member));
	}

	private void checkEmailDuplicate(String email) {
		if (email == null) return;

		if (memberRepository.existsByEmail(new Email(email))) {
			throw new DuplicateEmailException("이미 가입된 이메일입니다: " + email);
		}
	}

	private void checkUsernameDuplicate(String username) {
		if (memberRepository.existsByUsername(username)) {
			throw new DuplicateUsernameException("이미 가입된 Username입니다: " +  username);
		}
	}
}
