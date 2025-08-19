package algomarket.problemservice.adapter.webapi;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import algomarket.problemservice.application.dto.LoginRequest;
import algomarket.problemservice.application.provided.AuthenticationHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class AuthenticationApi {

	private final AuthenticationHandler authenticationHandler;

	@PostMapping("/login")
	public ResponseEntity<Void> login(@RequestBody @Valid LoginRequest loginRequest) {
		String token = authenticationHandler.login(loginRequest);

		return ResponseEntity.ok()
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
			.build();
	}
}
