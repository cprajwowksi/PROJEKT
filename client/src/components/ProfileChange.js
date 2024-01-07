import { useState } from 'react'

import { useFormik } from 'formik'
import * as Yup from 'yup'

import axios from 'axios'

const ProfileChange = ({user}) => {

    const [ status, setStatus ] = useState(null)

    const initialValues = {
        user_id:  user.user_id,
        first_name: user.first_name,
        dob_day: user.dob_day,
        dob_month: user.dob_month,
        dob_year: user.dob_year,
        show_gender: user.show_gender,
        gender_identity: user.gender_identity,
        gender_interest: user.gender_interest,
        about:user.about,
    }
    const validation = Yup.object({
        first_name: Yup.string().required('Required'),
        dob_day:  Yup.number().required('Day Required').max(31, 'DAY MAX 31'),
        dob_month: Yup.number().required('Month Required').max(12, 'MONTH MAX 12'),
        dob_year: Yup.number().required('Year Required').max(2005, 'MIN 18 LAT'),
        show_gender: Yup.boolean(),
        about: Yup.string(),
    })

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validation,
        onSubmit: async (values) => {
            console.log('submitted')
            console.log(values)
            try{
                const response = await axios.patch('http://localhost:8000/user', { values})
                setStatus(response.status)
            } catch (err) {
                console.log(err)
            }
        }
    })

    return (
        <>
            <div className="onboarding">
                <form onSubmit={formik.handleSubmit}>
                    <section>
                        <label htmlFor="first_name">First Name</label>
                        <input
                            id="first_name"
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            {...formik.getFieldProps('first_name')}

                        />

                        {formik.touched.first_name && formik.errors.first_name ? (<div>{formik.errors.first_name}</div>) : null}
                        <label>BirthDay</label>

                        <div className="multiple-input-container">
                            <input
                                id="dob_day"
                                type="number"
                                name="dob_day"
                                placeholder="DD"
                                {...formik.getFieldProps('dob_day')}
                            />

                            <input
                                id="dob_month"
                                type="number"
                                name="dob_month"
                                placeholder="MM"
                                {...formik.getFieldProps('dob_month')}
                            />

                            <input
                                id="dob_year"
                                type="number"
                                name="dob_year"
                                placeholder="YYYY"
                                {...formik.getFieldProps('dob_year')}
                            />
                            <div className="dob-errors">
                                {formik.touched.dob_day && formik.errors.dob_day ? (<div>{formik.errors.dob_day}</div>) : null}
                                {formik.touched.dob_month && formik.errors.dob_month ? (<div>{formik.errors.dob_month}</div>) : null}
                                {formik.touched.dob_year && formik.errors.dob_year ? (<div>{formik.errors.dob_year}</div>) : null}
                            </div>

                        </div>
                        <label>Gender</label>

                        <div className="multiple-input-container">

                            <input
                                id="man-gender-identity"
                                type="radio"
                                name="gender_identity"
                                value="man"
                                onChange={formik.handleChange}
                                checked={formik.values.gender_identity === "man"}
                            />
                            <label htmlFor="man-gender-identity">Man</label>

                            <input
                                id="woman-gender-identity"
                                type="radio"
                                name="gender_identity"
                                value="woman"
                                onChange={formik.handleChange}
                                checked={formik.values.gender_identity === "woman"}
                            />
                            <label htmlFor="woman-gender-identity">Woman</label>

                            <input
                                id="more-gender-identity"
                                type="radio"
                                name="gender_identity"
                                value="more"
                                onChange={formik.handleChange}
                                checked={formik.values.gender_identity === "more"}
                            />
                            <label htmlFor="more-gender-identity">More</label>


                        </div>
                        <label htmlFor="show-gender">Show gender on my profile</label>
                        <input
                            id="show-gender"
                            type="checkbox"
                            name="show_gender"
                            {...formik.getFieldProps('show_gender')}
                        />
                        <label>Show me</label>
                        <div className={"multiple-input-container"}>
                            <input
                                id="man-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="man"
                                onChange={formik.handleChange}
                                checked={formik.values.gender_interest === "man"}
                            />
                            <label htmlFor="man-gender-interest">Man</label>

                            <input
                                id="woman-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="woman"
                                onChange={formik.handleChange}
                                checked={formik.values.gender_interest === "woman"}
                            />
                            <label htmlFor="woman-gender-interest">Woman</label>

                            <input
                                id="everyone-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="more"
                                onChange={formik.handleChange}
                                checked={formik.values.gender_interest === "more"}
                            />
                            <label htmlFor="everyone-gender-interest">Everyone</label>
                        </div>
                        <label htmlFor="about"> About me </label>
                        <input
                            id="about"
                            type="text"
                            name="about"
                            placeholder="I like long walks..."
                            {...formik.getFieldProps('about')}
                        />
                        <input type="submit"></input>
                    </section>

                </form>
                {status === 200 ? <p className="font-bold">Pomyslnie zmieniono dane</p> : null}
            </div>

        </>
    )
}

export default ProfileChange