package algomarket.problemservice.adapter.webapi;

import java.net.URI;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import algomarket.problemservice.application.dto.InitiateUploadRequest;
import algomarket.problemservice.application.dto.InitiateUploadResponse;
import algomarket.problemservice.application.dto.MyProblemInfoResponse;
import algomarket.problemservice.application.dto.ProblemListResponse;
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

	@GetMapping
	public ResponseEntity<Page<ProblemListResponse>> listProblems(@RequestParam(value = "page", defaultValue = "0") Integer pageNumber) {
		Page<ProblemListResponse> response = problemFinder.listProblems(pageNumber);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{problemNumber}")
	public ResponseEntity<ProblemInfoResponse> find(@PathVariable Long problemNumber) {
		ProblemInfoResponse response = problemFinder.find(problemNumber);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/my")
	public ResponseEntity<Page<MyProblemInfoResponse>> listMyProblems(@RequestParam(value = "page", defaultValue = "0") Integer pageNumber, @CurrentUsername String username) {
		Page<MyProblemInfoResponse> response = problemFinder.listMyProblems(pageNumber, username);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/my/{problemId}")
	public ResponseEntity<MyProblemInfoResponse> findMyProblem(@PathVariable Long problemId, @CurrentUsername String username) {
		MyProblemInfoResponse response = problemFinder.findMyProblem(problemId, username);

		return ResponseEntity.ok(response);
	}

	@PutMapping("/publish/{problemId}")
	public ResponseEntity<Void> publishMyProblem(@PathVariable Long problemId, @CurrentUsername String username) {
		problemCreator.makePublic(problemId, username);

		return ResponseEntity.ok().build();
	}

	@PostMapping
	public ResponseEntity<ProblemInfoResponse> create(@RequestBody @Valid ProblemCreateRequest request, @CurrentUsername String username) {
		ProblemInfoResponse response = problemCreator.create(request, username);

		return ResponseEntity.created(URI.create("/problems/" + response.problemId()))
			.body(response);
	}

	@PostMapping("/initiate-upload")
	public ResponseEntity<InitiateUploadResponse> initiateUpload(@RequestBody @Valid InitiateUploadRequest request, @CurrentUsername String username) {
		InitiateUploadResponse response = problemFileManager.initiateUpload(request, username);

		return ResponseEntity.created(URI.create("/problems/initiate-upload/" + request.problemId()))
			.body(response);
	}
}
