package algomarket.problemservice.adapter.webapi;

import java.net.URI;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import algomarket.problemservice.application.dto.SubmissionHistoryForProblemResponse;
import algomarket.problemservice.application.dto.SubmitResponse;
import algomarket.problemservice.application.provided.ProgressStreamer;
import algomarket.problemservice.application.provided.SubmissionFinder;
import algomarket.problemservice.application.provided.SubmissionHandler;
import algomarket.problemservice.domain.submission.SubmitRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionApi {

	private final SubmissionHandler submissionHandler;
	private final ProgressStreamer progressStreamer;
	private final SubmissionFinder submissionFinder;

	@PostMapping
	public ResponseEntity<SubmitResponse> submit(@RequestBody @Valid SubmitRequest submitRequest, @CurrentUsername String username) {
		SubmitResponse response = submissionHandler.submit(submitRequest, username);

		return ResponseEntity.created(URI.create("/submissions/" + response.submissionId())).body(response);
	}

	@GetMapping(value = "/{submissionId}/progress", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public ResponseEntity<SseEmitter> progress(@PathVariable("submissionId") Long submissionId, @RequestParam String username) {
		SseEmitter emitter = progressStreamer.subscribeSubmissionProgress(username, submissionId);

		return ResponseEntity.ok(emitter);
	}

	@GetMapping("/history/{problemId}")
	public ResponseEntity<Page<SubmissionHistoryForProblemResponse>> findHistory(@PathVariable("problemId") Long problemId,
		@RequestParam Integer page, @RequestParam Integer size, @CurrentUsername String username) {
		Page<SubmissionHistoryForProblemResponse> responses = submissionFinder.findSubmittedForProblem(page, size, problemId, username);

		return ResponseEntity.ok(responses);
	}
}
