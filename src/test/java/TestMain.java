import com.library.User;
import com.library.Role;
import com.library.dao.InMemoryUserDao;
import com.library.dao.UserDao;
import com.library.exception.EmailAlreadyExistsException;
import com.library.exception.ValidationException;
import com.library.service.AuthService;

import java.util.Scanner;
public class TestMain {
    public static void main(String[] args) {
//        Scanner sc = new Scanner(System.in);
        UserDao dao = new InMemoryUserDao();
//
//        System.out.println("Enter your name : ");
//        String name = sc.next();
//
//        System.out.println("Enter your email : ");
//        String email = sc.next();
//
//        System.out.println("Enter your password : ");
//        String passwordHash = sc.next();
//
//
//        User u1 = new User(name, email, passwordHash, Role.MEMBER);
//        User u2 = new User(name, email, passwordHash, Role.ADMIN);
//
//        dao.save(u1);
//        dao.save(u2);
//
//        System.out.println("u1 id: " + u1.getId());
//        System.out.println("u2 id: " + u2.getId());
//        System.out.println(dao.findById(1));
//        System.out.println(dao.findById(999));
//        System.out.println(dao.findByEmail("PRIYA@gmail.com"));
//        System.out.println(dao.findByEmail("koi-nahi@x.com"));
//        System.out.println(dao.findAll());
//
//        User updatedUser = new User(
//                "Jahir Updated",
//                "jahir123@gmail.com",
//                "newPasswordHash",
//                Role.MEMBER
//        );
//
//        updatedUser.setId(1);

//        System.out.println(dao.update(updatedUser));
//        System.out.println(dao.deleteById(1));
//        System.out.println(dao.findById(1));
//        System.out.println(dao.findAll());

        AuthService auth = new AuthService(dao);
//        try {
//            auth.signup("","a@b.com","12345678");
//        } catch (ValidationException e) {
//            System.out.println("Error : "+ e.getMessage());;
//        }
//        try {
//            auth.signup("Rahul","abc","12345678");
//        } catch (ValidationException e) {
//            System.out.println("Error : "+ e.getMessage());;
//        }
//        try {
//            auth.signup("Rahul","a@b.com","123456");
//        } catch (ValidationException e) {
//            System.out.println("Error : "+ e.getMessage());;
//        }

        User u = auth.signup("Rahul", "rahul@gmail.com", "12345678");
        System.out.println(u);
        System.out.println("Hash: " + u.getPasswordHash());

        // Test 2: same email dobara
        try {
            auth.signup("Amit", "rahul@gmail.com", "12345678");
        } catch (EmailAlreadyExistsException e) {
            System.out.println("Error : " + e.getMessage());
        }

        // Test 3: same email, capital letters me
        try {
            auth.signup("Amit", "RAHUL@gmail.com", "12345678");
        } catch (EmailAlreadyExistsException e) {
            System.out.println("Error : " + e.getMessage());
        }

        // Test 4: null naam
        try {
            auth.signup(null, "a@b.com", "12345678");
        } catch (ValidationException e) {
            System.out.println("Error : " + e.getMessage());
        }

        // Test 5: naya email, ye pass hona chahiye
        User u2 = auth.signup("Priya", "priya@gmail.com", "abcdefgh");
        System.out.println(u2);
    }
}