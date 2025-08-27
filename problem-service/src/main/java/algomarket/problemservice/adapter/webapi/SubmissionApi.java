package algomarket.problemservice.adapter.webapi;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import algomarket.problemservice.application.dto.SubmitResponse;
import algomarket.problemservice.application.provided.SubmissionHandler;
import algomarket.problemservice.domain.submission.SubmitRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionApi {

	private final SubmissionHandler submissionHandler;

	@PostMapping
	public ResponseEntity<SubmitResponse> submit(@RequestBody @Valid SubmitRequest submitRequest, @AuthenticationPrincipal String username) {
		SubmitResponse response = submissionHandler.submit(submitRequest, username);

		return ResponseEntity.created(URI.create("/submissions/" + response.submissionId())).body(response);
	}
}
