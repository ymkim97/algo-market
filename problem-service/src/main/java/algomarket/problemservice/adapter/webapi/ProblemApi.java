package algomarket.problemservice.adapter.webapi;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import algomarket.problemservice.application.dto.InitiateUploadRequest;
import algomarket.problemservice.application.dto.InitiateUploadResponse;
import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.provided.ProblemFileManager;
import algomarket.problemservice.application.provided.ProblemFinder;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/problems")
@RequiredArgsConstructor
public class ProblemApi {

	private final ProblemFinder problemFinder;
	private final ProblemCreator problemCreator;
	private final ProblemFileManager problemFileManager;

	@GetMapping("/{problemId}")
	public ResponseEntity<ProblemInfoResponse> find(@PathVariable Long problemId) {
		ProblemInfoResponse response = problemFinder.find(problemId);

		return ResponseEntity.ok()
			.body(response);
	}

	@PostMapping
	public ResponseEntity<ProblemInfoResponse> create(@RequestBody @Valid ProblemCreateRequest request) {
		ProblemInfoResponse response = problemCreator.create(request);

		return ResponseEntity.created(URI.create("/problems/" + response.problemId()))
			.body(response);
	}

	@PostMapping("/initiate-upload")
	public ResponseEntity<InitiateUploadResponse> initiateUpload(@RequestBody @Valid InitiateUploadRequest request) {
		InitiateUploadResponse response = problemFileManager.initiateUpload(request);

		return ResponseEntity.created(URI.create("/problems/initiate-upload/" + request.problemId()))
			.body(response);
	}
}
