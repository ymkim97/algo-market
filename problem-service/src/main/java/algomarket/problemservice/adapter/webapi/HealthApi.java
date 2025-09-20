package algomarket.problemservice.adapter.webapi;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HealthApi {

	@GetMapping("/")
	public ResponseEntity<Void> healthCheck() {
		return ResponseEntity.ok().build();
	}
}
