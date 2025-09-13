package algomarket.problemservice;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class ProblemServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProblemServiceApplication.class, args);
	}

}
