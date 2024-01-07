import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AuthModal = ({ setShowModal, setIsSignUp, isSignUp }) => {
    const [cookie, setCookie] = useCookies(['user']);
    const navigate = useNavigate();

    const handleClick = () => {
        setShowModal(false);
    };

    const initialValues = {
        email: '',
        password: '',
        confirmPassword: '',
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().required('Password is required').min(3, 'Password needs to be longer than 3 letters'),
        confirmPassword: isSignUp
            ? Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Confirm Password is required')
            : Yup.string(),
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await axios.post(`http://localhost:8000/${isSignUp ? 'signup' : 'login'}`, {
                    email: values.email,
                    password: values.password,
                });

                setCookie('Email', response.data.email);
                setCookie('UserId', response.data.userId);
                setCookie('AuthToken', response.data.token);

                const success = response.status === 201;

                if (success && isSignUp) navigate('/onboarding');
                if (success && !isSignUp) navigate('/dashboard');

                window.location.reload();
            } catch (error) {
                console.log(error);
            }
        },
    });

    return (
        <div className="auth-modal">
            <div className="closeIcon" onClick={handleClick}>
                &#10006;
            </div>
            <h2>{isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}</h2>
            <p>
                By clicking Log In, you agree to our terms. Learn how we process your data in our Privacy Policy and Cookie
                Policy
            </p>
            <form onSubmit={formik.handleSubmit}>
                <input type="email" id="email" name="email" placeholder="email" {...formik.getFieldProps('email')} />
                {formik.touched.email && formik.errors.email ? <div>{formik.errors.email}</div> : null}

                <input type="password" id="password" name="password" placeholder="password" {...formik.getFieldProps('password')} />
                {formik.touched.password && formik.errors.password ? <div>{formik.errors.password}</div> : null}

                {isSignUp && (
                    <>
                        <input type="password" id="password_check" name="password_check" placeholder="confirm-password" {...formik.getFieldProps('confirmPassword')} />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? <div>{formik.errors.confirmPassword}</div> : null}
                    </>
                )}

                <input className="secondary-button" type="submit" />
            </form>
            <hr />
            <h2>GET THE APP</h2>
        </div>
    );
};

export default AuthModal;
