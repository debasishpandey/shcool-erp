import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

public class TestJwt {
    public static void main(String[] args) {
        String token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiU1VQRVJfQURNSU4iLCJ0ZW5hbnRJZCI6MSwidXNlcklkIjoxLCJzdWIiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzg3MzAzNzAzLCJleHAiOjE3ODczMDQ2MDN9.ELJN0hY4HuCXO3pfwGIdVdAjAddb7gVpUxe5N2YLKqY";
        String secretKeyStr = "ThisIsASecretKeyForJwtAuthenticationThatNeedsToBeLongEnough";
        byte[] keyBytes = Decoders.BASE64.decode(secretKeyStr);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            System.out.println("UserId class: " + claims.get("userId").getClass().getName());
            System.out.println("UserId with Long.class: " + claims.get("userId", Long.class));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
