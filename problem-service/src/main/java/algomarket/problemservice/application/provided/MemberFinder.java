package algomarket.problemservice.application.provided;

import algomarket.problemservice.domain.member.MemberInfoResponse;

public interface MemberFinder {

	MemberInfoResponse find(String username);
}
