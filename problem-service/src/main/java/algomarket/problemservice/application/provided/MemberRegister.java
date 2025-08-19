package algomarket.problemservice.application.provided;

import algomarket.problemservice.domain.member.MemberInfoResponse;
import algomarket.problemservice.domain.member.MemberRegisterRequest;

public interface MemberRegister {

	MemberInfoResponse register(MemberRegisterRequest request);
}
