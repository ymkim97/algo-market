package algomarket.problemservice.application.required;

import java.util.Optional;

import org.springframework.data.repository.Repository;

import algomarket.problemservice.domain.member.Member;
import algomarket.problemservice.domain.shared.Email;

public interface MemberRepository extends Repository<Member, Long> {

	Member save(Member member);

	Optional<Member> findById(Long memberId);

	Optional<Member> findByUsername(String username);

	boolean existsByEmail(Email email);

	boolean existsByUsername(String username);
}
