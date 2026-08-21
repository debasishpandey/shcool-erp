package co.demisha.schoolerp.security;

import co.demisha.schoolerp.user.User;
import co.demisha.schoolerp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                
        return new SecurityUser(user);
    }
    
    public UserDetails loadUserByIdAndTenantId(Long id, Long tenantId) {
        User user = userRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found in tenant"));
        return new SecurityUser(user);
    }
}
