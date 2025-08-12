package algomarket.problemservice.adapter.webapi;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import algomarket.problemservice.application.provided.MemberRegister;
import algomarket.problemservice.domain.member.MemberInfoResponse;
import algomarket.problemservice.domain.member.MemberRegisterRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberApi {

	private final MemberRegister memberRegister;

	@PostMapping
	public ResponseEntity<MemberInfoResponse> register(@RequestBody @Valid MemberRegisterRequest registerRequest) {
		MemberInfoResponse response = memberRegister.register(registerRequest);

		return ResponseEntity.created(URI.create("/members" + response.memberId())).body(response);
	}
}
